import { Button, Group, Modal, NumberInput, Stack, Title } from '@mantine/core';
import React, { useCallback, useEffect, useState } from 'react';
import { CARD_SHIPPING_STATUS, CARD_STATUS, notifyError, notifySuccess } from '@trok-app/shared-utils';
import { trpc } from '../utils/clients';
import { useSession } from 'next-auth/react';
import { IconCheck, IconX } from '@tabler/icons';

const PaymentModal = ({ opened, onClose, onSubmit }) => {
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
					parser={(value: string) => value.replace(/\£\s?|(,*)/g, '')}
					formatter={(value: string) =>
						!Number.isNaN(parseFloat(value)) ? `£ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '£ '
					}
					value={amount}
					onChange={setAmount}
				/>
				<Group position="right">
					<Button onClick={() => onSubmit(amount)}>Create Payment</Button>
				</Group>
			</Stack>
		</Modal>
	);
};

const CardTestButton = ({ id, cardShippingStatus, cardStatus, stripeId }) => {
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
			utils.invalidate({ userId: session.id }).then(r => console.log(input, 'Cards refetched'));
		}
	});

	const handleOnClick = useCallback(async (amount=0) => {
		if (cardShippingStatus === CARD_SHIPPING_STATUS.PENDING) {
			await shipMutation.mutateAsync({ id, stripeId });
		} else if (cardShippingStatus === CARD_SHIPPING_STATUS.SHIPPED) {
			await deliverMutation.mutateAsync({ id, stripeId });
		} else if (cardStatus === CARD_STATUS.ACTIVE) {
			try {
				const result = await paymentMutation.mutateAsync({ card_id: id, stripeId, amount });
				console.log(result);
				notifySuccess(
					'card-payment-success',
					`Payment of £${amount} was successful! 😊`,
					<IconCheck size={20} />
				);
			} catch (err) {
				notifyError('card-payment-failed', err?.error?.message ?? err.message, <IconX size={20} />);
			}
		} else {
			alert('Card has already been shipped and delivered!');
		}
	}, [id, cardShippingStatus, cardStatus, stripeId]);

	useEffect(() => console.log(cardShippingStatus), [cardShippingStatus]);

	let buttonText =
		cardShippingStatus === CARD_SHIPPING_STATUS.SHIPPED
			? 'Deliver Card'
			: cardShippingStatus === CARD_SHIPPING_STATUS.PENDING
			? 'Ship Card'
			: 'Pay';

	return (
		<>
			<PaymentModal opened={opened} onClose={() => setOpened(false)} onSubmit={handleOnClick} />
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

export default CardTestButton;
