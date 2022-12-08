import { Button, Group, Loader, Modal, NumberInput, Stack, Text } from '@mantine/core';
import React, { useCallback, useState } from 'react';
import { CARD_SHIPPING_STATUS, CARD_STATUS, notifyError, notifySuccess } from '@trok-app/shared-utils';
import { trpc } from '../utils/clients';
import { useSession } from 'next-auth/react';
import { IconCheck, IconX } from '@tabler/icons';

const PaymentModal = ({ opened, onClose, onSubmit, loading }) => {
	const [amount, setAmount] = useState(0);
	return (
		<Modal
			opened={opened}
			onClose={onClose}
			centered
			size='lg'
			padding='lg'
			title='Choose amount'
			styles={{
				title: {
					fontSize: 20
				}
			}}
		>
			<Stack p="xs">
				<NumberInput
					required
					type='text'
					label='Amount'
					min={100}
					max={1000000}
					step={100}
					parser={(value: string) => value.replace(/£\s?|(,*)/g, '')}
					formatter={(value: string) =>
						!Number.isNaN(parseFloat(value)) ? `£ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '£ '
					}
					value={amount}
					onChange={setAmount}
				/>
				<Group position="right">
					<Button onClick={() => onSubmit(amount)} loading={loading}>
						<Text>Create Payment</Text>
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
};

const CardPaymentButton = ({ cardId, cardShippingStatus, cardStatus, stripeId }) => {
	const [loading, setLoading] = useState(false);
	const [opened, setOpened] = useState(false);
	const { data: session } = useSession();
	const utils = trpc.useContext();
	const shipMutation = trpc.shipCard.useMutation({
		onSuccess: function (input) {
			utils.invalidate({ userId: session.id }).then(r => console.log(input, 'Cards refetched'));
		}
	});
	const deliverMutation = trpc.deliverCard.useMutation({
		onSuccess: function (input) {
			utils.invalidate({ userId: session.id }).then(r => console.log(input, 'Cards refetched'));
		}
	});
	const paymentMutation = trpc.createTestPayment.useMutation({
		onSuccess: function (input) {
			utils.invalidate({ userId: session.id }, {queryKey: ['getCards']}).then(r => console.log(input, 'Cards refetched'));
			utils.invalidate({ card_id: cardId }, {queryKey: ['getCardTransactions']}).then(r => console.log(input, 'Card Transactions refetched'));
		}
	});

	const handleOnClick = useCallback(async (amount=0) => {
		if (cardShippingStatus === CARD_SHIPPING_STATUS.PENDING) {
			await shipMutation.mutateAsync({ card_id: cardId, stripeId });
		} else if (cardShippingStatus === CARD_SHIPPING_STATUS.SHIPPED) {
			await deliverMutation.mutateAsync({ card_id: cardId, stripeId });
		} else if (cardStatus === CARD_STATUS.ACTIVE) {
			setLoading(true)
			try {
				await paymentMutation.mutateAsync({ card_id: cardId, stripeId, amount });
				setOpened(false)
				setLoading(false)
				notifySuccess(
					'card-payment-success',
					`Payment of £${amount} was successful! 😊`,
					<IconCheck size={20} />
				);
			} catch (err) {
				console.error(err)
				setLoading(false)
				notifyError('card-payment-failed', err?.error?.message ?? err.message, <IconX size={20} />);
			}
		} else {
			notifyError('create-card-payment-failed', 'Please activate your card and try again', <IconX size={20} />);
		}
	}, [cardId, cardShippingStatus, cardStatus, stripeId]);

	const buttonText =
		cardShippingStatus === CARD_SHIPPING_STATUS.SHIPPED
			? 'Deliver Card'
			: cardShippingStatus === CARD_SHIPPING_STATUS.PENDING
			? 'Ship Card'
			: 'Pay';

	return (
		<>
			<PaymentModal loading={loading} opened={opened} onClose={() => setOpened(false)} onSubmit={handleOnClick} />
			<Button
				variant='light'
				size='md'
				onClick={() => cardStatus === CARD_STATUS.ACTIVE ? setOpened(true) : handleOnClick()}
			>
				{buttonText}
			</Button>
		</>
	);
};

export default CardPaymentButton;
