import React, { useCallback, useEffect } from 'react';
import { Group, Modal, Stack, Text } from '@mantine/core';
import { useCounter, useDocumentVisibility } from '@mantine/hooks';
import { signOut } from 'next-auth/react';

let interval;
const SessionTimeout = ({ opened=false, onClose }) => {
	const document_state = useDocumentVisibility();
	const [count, handlers] = useCounter(30, { min: 0, max: 30 });
	const countdownLogout = useCallback(() => handlers.decrement(), []);

	useEffect(() => {
		if (opened) {
			if (document_state === 'visible') {
				interval = setInterval(countdownLogout, 1000);
			} else {
				signOut().then(() => console.log('signed out'))
			}
		}
		return () => {
			handlers.reset();
			clearInterval(interval);
		};
	}, [opened, document_state]);

	useEffect(() => {
		if (count <= 0) signOut().then(() => console.log('signed out'));
	}, [count]);

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			centered
			size='md'
			title='Your session is about to expire!'
			styles={{
				title: {
					fontWeight: 600,
					fontSize: 20
				}
			}}
		>
			<Group align='center'>
				<Stack>
					<Text size='lg'>
						You will be logged out in <span className='font-bold'>{count}</span> seconds
					</Text>
					<Text size='sm'>Do you want to stay signed in?</Text>
				</Stack>
			</Group>
		</Modal>
	);
};

export default SessionTimeout;
