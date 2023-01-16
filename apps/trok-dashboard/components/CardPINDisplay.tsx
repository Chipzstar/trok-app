import React, { useEffect, useRef, useState } from 'react';
import { useStripe } from '@stripe/react-stripe-js';
import { IconEye, IconEyeOff, IconX } from '@tabler/icons';
import { ActionIcon, Button, Dialog, Group, PasswordInput, Stack, Title } from '@mantine/core';
import { trpc } from '../utils/clients';
import { useSession } from 'next-auth/react';
import { comparePassword, notifyError } from '@trok-app/shared-utils';

const PasswordDialog = ({ opened, onClose, onConfirm, loading }) => {
	const [password, setPassword] = useState('');
	return (
		<Dialog
			opened={opened}
			onClose={onClose}
			size='xl'
			p='md'
			transition='fade'
			transitionDuration={300}
			transitionTimingFunction='ease'
			position={{
				bottom: 20,
				right: 25
			}}
		>
			<Stack>
				<Title size='h3'>Please confirm your password</Title>
				<PasswordInput label='Password' value={password} onChange={e => setPassword(e.currentTarget.value)} />
				<Group position='right'>
					<Button variant='white' onClick={onClose}>
						Cancel
					</Button>
					<Button loading={loading} onClick={() => onConfirm(password)}>
						Submit
					</Button>
				</Group>
			</Stack>
		</Dialog>
	);
};

const CardPINDisplay = ({ card_id, nonce, ephemeral_key_secret }) => {
	const [isVisible, setVisibility] = useState(false);
	const [loading, setLoading] = useState(false);
	const [passwordDialog, showPasswordDialog] = useState(false);
	const { data: session } = useSession();
	const { data: user } = trpc.user.getAccount.useQuery({ id: session?.id }, { enabled: !!session?.id });
	const stripe = useStripe();
	const pinRef = useRef(null);
	const [pinElement, setPinElement] = useState(null);

	useEffect(() => {
		if (card_id && nonce && ephemeral_key_secret) {
			setPinElement(
				stripe.elements().create('issuingCardPinDisplay', {
					issuingCard: card_id,
					nonce: nonce,
					ephemeralKeySecret: ephemeral_key_secret,
					style: {
						base: {
							color: 'black',
							fontSize: '20px'
						}
					}
				})
			);
		}
	}, [card_id, nonce, ephemeral_key_secret]);

	useEffect(() => {
		if (pinElement) {
			if (isVisible) {
				console.log('mounting...');
				pinElement.mount('#card-pin');
			} else {
				console.log('unmounting...');
				pinElement.unmount();
			}
		}
	}, [pinElement, isVisible]);

	return (
		<Group>
			<PasswordDialog
				opened={passwordDialog}
				loading={loading}
				onClose={() => showPasswordDialog(false)}
				onConfirm={async input => {
					const is_match = await comparePassword(input, user?.password);
					if (is_match) {
						setVisibility(true);
						showPasswordDialog(false);
					} else {
						notifyError('incorrect-password', 'Password is incorrect', <IconX size={20} />);
					}
				}}
			/>
			<label>
				View Card Pin
				<div ref={pinRef} id='card-pin'></div>
			</label>
			{isVisible ? (
				<ActionIcon onClick={() => setVisibility(false)}>
					<IconEyeOff />
				</ActionIcon>
			) : (
				<ActionIcon onClick={() => showPasswordDialog(true)}>
					<IconEye />
				</ActionIcon>
			)}
		</Group>
	);
};

export default CardPINDisplay;
