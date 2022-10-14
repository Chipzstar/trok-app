import { Button, Card, Group, Text, Stack } from '@mantine/core';
import React from 'react';
import { useLocalStorage } from '@mantine/hooks';
import { STORAGE_KEYS } from '../../utils/constants';

const Personal = () => {
	const [account, setAccount] = useLocalStorage({key: STORAGE_KEYS.ACCOUNT, defaultValue: null})
	return (
		<div className='container py-5'>
			<Card shadow='sm' p="xl" radius='xs' className="w-1/2">
				<Stack>
					<div className="flex flex-col">
						<span>Legal first name</span>
						<span className="font-semibold">{account?.firstname}</span>
					</div>
					<div className="flex flex-col">
						<span>Legal last name</span>
						<span className="font-semibold">{account?.lastname}</span>
					</div>
					<div className="flex flex-col">
						<span>Business email</span>
						<span className="font-semibold">{account?.email}</span>
					</div>
					<div className="flex flex-col">
						<span>Business phone number</span>
						<span className="font-semibold">{account?.phone}</span>
					</div>
					<div className="flex flex-col">
						<span>Password</span>
						<span className="font-semibold" data-hidden-value={account?.password}>
							<span className="inline">****************</span>
						</span>
					</div>
					<Group py="xl">
						<Button>
							<Text weight="normal">Edit</Text>
						</Button>
					</Group>
				</Stack>
			</Card>
		</div>
	);
};

export default Personal;
