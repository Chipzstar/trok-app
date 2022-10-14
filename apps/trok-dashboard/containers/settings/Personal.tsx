import { Button, Card, Group, Text, Stack, TextInput, PasswordInput } from '@mantine/core';
import React, { useState } from 'react';
import { useLocalStorage } from '@mantine/hooks';
import { STORAGE_KEYS } from '../../utils/constants';

const DynamicInputField = ({ editMode, value, isPassword = false }) => {
	return editMode && isPassword ? (
		<PasswordInput defaultValue={value} />
	) : editMode ? (
		<TextInput defaultValue={value} />
	) : (
		<span className='font-semibold'>{isPassword ? "***********" : value}</span>
	);
};

const Personal = () => {
	const [account, setAccount] = useLocalStorage({ key: STORAGE_KEYS.ACCOUNT, defaultValue: null });
	const [editMode, setEditMode] = useState(false);

	const toggleEditMode = () => setEditMode(!editMode);

	return (
		<div className='container py-5'>
			<Card shadow='sm' p='xl' radius='xs' className='w-1/2'>
				<Stack>
					<div className='flex flex-col'>
						<span>Legal first name</span>
						<DynamicInputField editMode={editMode} value={account?.firstname} />
					</div>
					<div className='flex flex-col'>
						<span>Legal last name</span>
						<DynamicInputField editMode={editMode} value={account?.lastname} />
					</div>
					<div className='flex flex-col'>
						<span>Business email</span>
						<DynamicInputField editMode={editMode} value={account?.email} />
					</div>
					<div className='flex flex-col'>
						<span>Business phone number</span>
						<DynamicInputField editMode={editMode} value={account?.phone} />
					</div>
					<div className='flex flex-col'>
						<span>Password</span>
						<DynamicInputField editMode={editMode} value={account?.password} isPassword/>
					</div>
					<Group py='xl'>
						<Button onClick={toggleEditMode}>
							<Text weight='normal'>{editMode ? 'Save' : 'Edit'}</Text>
						</Button>
					</Group>
				</Stack>
			</Card>
		</div>
	);
};

export default Personal;
