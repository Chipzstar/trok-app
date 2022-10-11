import { Button } from '@mantine/core';
import React from 'react';
import { useRouter } from 'next/router';

export function Index({ auth, setAuth }) {
	const router = useRouter();
	return (
		<div className='h-screen flex flex-col justify-center p-5 overflow-hidden w-full'>
			<div className='m-auto'>
				<Button color='red' size='lg' px='xl' onClick={() => {
					setAuth(false);
					router.push('/signup');
				}}>Restart Signup</Button>
			</div>
		</div>
	);
}

export default Index;
