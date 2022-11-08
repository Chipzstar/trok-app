import React, { useEffect, useRef, useState } from 'react';
import { useElements, useStripe } from '@stripe/react-stripe-js';
import { IconCopy, IconEye, IconEyeOff } from '@tabler/icons';
import { ActionIcon, Group } from '@mantine/core';

const CardPINDisplay = ({ card_id, nonce, ephemeral_key_secret }) => {
	const [isVisible, setVisibility] = useState(false);
	const elements = useElements();
	const stripe = useStripe();
	const pinRef = useRef(null)

	if (isVisible && card_id && nonce && ephemeral_key_secret) {
		//@ts-ignore
		const pinElement = stripe.elements().create('issuingCardPinDisplay', {
			issuingCard: card_id,
			nonce: nonce,
			ephemeralKeySecret: ephemeral_key_secret,
			style: {
				base: {
					color: 'black',
					fontSize: '20px'
				}
			}
		});
		/*const numberCopy = elements.create('issuingCardCopyButton', {
			toCopy: 'pin',
			style: {
				base: {
					fontSize: '12px',
					lineHeight: '24px'
				}
			}
		});
		numberCopy.mount('#card-pin-copy');*/
		pinElement.mount('#card-pin');
	}
	useEffect(() => console.log(pinRef.current), [pinRef])
	return (
		<Group>
			<label>View Card Pin
				<div ref={pinRef} id='card-pin'></div>
			</label>
			{isVisible ? <ActionIcon onClick={() => setVisibility(false)}>
					<IconEyeOff />
				</ActionIcon> :
				<ActionIcon onClick={() => setVisibility(true)}>
					<IconEye />
				</ActionIcon>}
			{/*<label>
				<button id='card-pin-copy' color='gray'>Copy</button>
			</label>*/}
		</Group>
	);
};

export default CardPINDisplay;
