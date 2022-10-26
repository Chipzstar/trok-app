import { Button } from '@mantine/core';
import React, { useCallback, useEffect } from 'react';
import { CARD_SHIPPING_STATUS, CARD_STATUS, notifyError, notifySuccess } from '@trok-app/shared-utils';
import { trpc } from '../utils/clients';
import { useSession } from 'next-auth/react';
import { IconCheck, IconX } from '@tabler/icons';

const CardTestButton = ({ id, cardShippingStatus, cardStatus, stripeId }) => {
	const { data: session } = useSession()
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

	const handleOnClick = useCallback(async () => {
		if (cardShippingStatus === CARD_SHIPPING_STATUS.PENDING) {
			await shipMutation.mutateAsync({ id, stripeId });
		} else if (cardShippingStatus === CARD_SHIPPING_STATUS.SHIPPED) {
			await deliverMutation.mutateAsync({ id, stripeId });
		} else if (cardStatus === CARD_STATUS.ACTIVE) {
			try {
				const result = await paymentMutation.mutateAsync({ card_id: id, stripeId });
				console.log(result)
				notifySuccess('card-payment-success', 'Payment of £10 was successfully processed', <IconCheck size={20} />)
			} catch (err) {
			    notifyError('card-payment-failed', err.message, <IconX size={20} />)
			}
		} else {
			alert('Card has already been shipped and delivered!');
		}
	}, [id, cardShippingStatus, cardStatus, stripeId])

	useEffect(() => console.log(cardShippingStatus), [cardShippingStatus]);

	let buttonText = cardShippingStatus === CARD_SHIPPING_STATUS.SHIPPED ? "Deliver Card" : cardShippingStatus === CARD_SHIPPING_STATUS.PENDING ? "Ship Card" : "Pay"

	return <Button variant="light" size="md" onClick={handleOnClick}>{buttonText}</Button>;
};

export default CardTestButton;
