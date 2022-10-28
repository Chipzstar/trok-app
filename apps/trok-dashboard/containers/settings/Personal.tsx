import { Button, Card, Group, Text, Stack, Loader } from '@mantine/core';
import { useForm } from '@mantine/form';
import React, { useCallback, useState } from 'react';
import DynamicInputField from '../../components/DynamicInputField';
import { trpc } from '../../utils/clients';
import { getE164Number, notifyError, notifySuccess } from '@trok-app/shared-utils';
import { IconCheck, IconX } from '@tabler/icons';

const Personal = ({ stripe, account }) => {
	const [loading, setLoading] = useState(false);
	const [editMode, setEditMode] = useState(false);
	const toggleEditMode = () => setEditMode(!editMode);
	const mutation = trpc.updatePersonalInfo.useMutation();

	const form = useForm({
		initialValues: {
			firstname: account?.firstname,
			lastname: account?.lastname,
			email: account?.email,
			phone: account?.phone
		}
	});

	const handleSubmit = useCallback(
		async values => {
			setLoading(true);
			try {
				await mutation.mutateAsync({
					id: account.id,
					stripe,
					...values,
					...(form.isDirty('phone') && { phone: getE164Number(values.phone) })
				});
				setLoading(false);
				setEditMode(false);
				notifySuccess(
					'update-personal-success',
					'Account information updated successfully',
					<IconCheck size={20} />
				);
			} catch (err) {
				console.error(err);
				setLoading(false);
				notifyError('update-personal-failed', err.message, <IconX size={20} />);
			}
		},
		[form]
	);

	return (
		<form className='container py-5' onSubmit={form.onSubmit(handleSubmit)}>
			<Card shadow='sm' p='xl' radius='xs' className='w-1/2'>
				<Stack>
					<div className='flex flex-col'>
						<span>Legal first name</span>
						<DynamicInputField editMode={editMode} {...form.getInputProps('firstname')} />
					</div>
					<div className='flex flex-col'>
						<span>Legal last name</span>
						<DynamicInputField editMode={editMode} {...form.getInputProps('lastname')} />
					</div>
					<div className='flex flex-col'>
						<span>Business email</span>
						<DynamicInputField disabled={true} editMode={editMode} {...form.getInputProps('email')} />
					</div>
					<div className='flex flex-col'>
						<span>Business phone number</span>
						<DynamicInputField editMode={editMode} {...form.getInputProps('phone')} />
					</div>
					<Group py='xl'>
						{editMode ? (
							<Button type='submit' disabled={!form.isDirty()}>
								<Loader size='sm' className={`mr-3 ${!loading && 'hidden'}`} color='white' />
								<Text weight='normal'>Save</Text>
							</Button>
						) : (
							<Button type='button' onClick={toggleEditMode}>
								<Text weight='normal'>Edit</Text>
							</Button>
						)}
					</Group>
				</Stack>
			</Card>
		</form>
	);
};

export default Personal;
