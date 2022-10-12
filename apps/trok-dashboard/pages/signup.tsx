import React from 'react';
import Step1 from '../containers/Step1';
import { useLocalStorage } from '@mantine/hooks';

export function Signup() {
	const [newAccount, setNewAccount] = useLocalStorage({key: "account", defaultValue: null});

	return (
		<div className='h-screen w-full overflow-x-hidden p-5'>
			<Step1 setNewAccount={setNewAccount} />
		</div>
	);
}

export default Signup;
