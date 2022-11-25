import React, { useCallback, useEffect } from 'react';
import { Button, Group, Modal, Stack, Text } from '@mantine/core';
import { useCounter } from '@mantine/hooks';
import { signOut } from 'next-auth/react';

const SessionTimeout = ({ opened, onClose }) => {
	const [count, handlers] = useCounter(60, { min: 0, max: 60 });
	const countdownLogout = useCallback(() => handlers.decrement(), []);

	useEffect(() => {
		const interval = setInterval(countdownLogout, 1000);
		return () => {
			handlers.reset();
			clearInterval(interval);
		}
	}, [opened]);

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
