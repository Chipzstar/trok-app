import React, { useState } from 'react';
import { useElements } from '@stripe/react-stripe-js';
import { IconCopy, IconEye, IconEyeOff } from '@tabler/icons';
import { ActionIcon, Group } from '@mantine/core';

const CardPINDisplay = ({ card_id, nonce, ephemeral_key_secret }) => {
	const [isVisible, setVisibility] = useState(false);
	const elements = useElements();
	if (card_id && nonce && ephemeral_key_secret) {
		//@ts-ignore
		const pinElement = elements.create('issuingCardPinDisplay', {
			issuingCard: card_id,
			nonce: nonce,
			ephemeralKeySecret: ephemeral_key_secret,
			style: {
				base: {
					border: '2px solid red',
					color: 'black',
					fontSize: '20px'
				}
			}
		});
		const numberCopy = elements.create('issuingCardCopyButton', {
			toCopy: 'pin',
			style: {
				base: {
					fontSize: '12px',
					lineHeight: '24px'
				}
			}
		});
		numberCopy.mount('#card-pin-copy');
		pinElement.mount('#card-pin');
	}
	return (
		<Group>
			<label>View Card Pin
				<div id='card-pin'></div>
			</label>
			{isVisible ? <ActionIcon onClick={() => setVisibility(false)}>
					<IconEyeOff />
				</ActionIcon> :
				<ActionIcon onClick={() => setVisibility(true)}>
					<IconEye />
				</ActionIcon>}
			<label>
				<button id='card-pin-copy' color='gray'>Copy</button>
			</label>
		</Group>
	);
};

export default CardPINDisplay;
