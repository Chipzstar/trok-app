import { Button } from '@mantine/core';
import React from 'react';
import { useRouter } from 'next/router';
import { useLocalStorage } from '@mantine/hooks';
import { PATHS } from '../utils/constants';

export function Index({ setAuth }) {
	const router = useRouter();
	const [newAccount, setAccount] = useLocalStorage({ key: 'account', defaultValue: null });
	const [complete, setComplete] = useLocalStorage({ key: 'complete', defaultValue: false });
	return (
		<div className='flex h-screen w-full flex-col justify-center p-5'>
			<div className='m-auto'>
				<Button
					color='red'
					size='lg'
					px='xl'
					onClick={() => {
						setAccount(null);
						setComplete(false);
						setAuth(false);
						router.push(PATHS.SIGNUP);
					}}
				>
					Restart Signup
				</Button>
			</div>
		</div>
	);
}

export default Index;
