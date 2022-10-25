import { Button } from '@mantine/core';
import React, { useCallback, useEffect } from 'react';
import { CARD_SHIPPING_STATUS } from '@trok-app/shared-utils';
import { trpc } from '../utils/clients';
import { useSession } from 'next-auth/react';

const CardTestButton = ({ id, cardShippingStatus, stripeId }) => {
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

	const handleOnClick = useCallback(async () => {
		switch (cardShippingStatus) {
			case CARD_SHIPPING_STATUS.PENDING:
				await shipMutation.mutateAsync({ id, stripeId });
				break;
			case CARD_SHIPPING_STATUS.SHIPPED:
				await deliverMutation.mutateAsync({ id, stripeId });
				break;
			default:
				alert('Card has already been shipped and delivered!');
				break;
		}
	}, [id, cardShippingStatus, stripeId])

	useEffect(() => console.log(cardShippingStatus), [cardShippingStatus]);

	let buttonText = cardShippingStatus === CARD_SHIPPING_STATUS.SHIPPED ? "Deliver Card" : cardShippingStatus === CARD_SHIPPING_STATUS.PENDING ? "Ship Card" : "Card Delivered"

	return <Button variant="light" size="md" onClick={handleOnClick}>{buttonText}</Button>;
};

export default CardTestButton;
