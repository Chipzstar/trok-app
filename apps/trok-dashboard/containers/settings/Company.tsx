import React, { useCallback, useState } from 'react';
import { Button, Card, Group, Select, Stack, Text, TextInput } from '@mantine/core';
import { INDUSTRY_TYPES } from '../../utils/constants';
import { useForm } from '@mantine/form';
import { trpc } from '../../utils/clients';
import { notifyError, notifySuccess } from '@trok-app/shared-utils';
import { IconCheck, IconX } from '@tabler/icons';
import { DynamicInputFieldProps } from '../../utils/types';

const DynamicInputField = ({
	editMode,
	value,
	onChange,
	error,
	onFocus,
	onBlur,
	is_merchant_code = false,
	is_business_type = false
}: DynamicInputFieldProps) => {
	if (editMode && is_merchant_code) {
		return (
			<Select
				data={INDUSTRY_TYPES}
				value={value}
				error={error}
				onChange={onChange}
				onFocus={onFocus}
				onBlur={onBlur}
			/>
		);
	} else if (editMode && is_business_type) {
		return (
			<Select
				data={[
					{
						label: 'Public Company',
						value: 'public_corporation'
					},
					{
						label: 'Private Company',
						value: 'private_corporation'
					}
				]}
				value={value}
				error={error}
				onChange={onChange}
				onFocus={onFocus}
				onBlur={onBlur}
			/>
		);
	} else {
		return editMode ? (
			<TextInput value={value} onChange={onChange} error={error} onFocus={onFocus} onBlur={onBlur} />
		) : (
			<span className='font-semibold'>
				{is_merchant_code ? INDUSTRY_TYPES.find(item => item.value === value)?.label : value}
			</span>
		);
	}
};

const Company = ({ user_id, stripe, business }) => {
	const [loading, setLoading] = useState(false);
	const [editMode, setEditMode] = useState(false);
	const toggleEditMode = () => setEditMode(!editMode);
	const update = trpc.user.updateCompanyInfo.useMutation();

	const form = useForm({
		initialValues: {
			legal_name: business?.legal_name,
			num_monthly_invoices: business?.num_monthly_invoices,
			business_type: business?.business_type,
			merchant_category_code: business?.merchant_category_code,
			business_crn: business?.business_crn,
			num_vehicles: business?.num_vehicles,
			business_url: business?.business_url
		},
	});

	const handleSubmit = useCallback(
		async values => {
			setLoading(true);
			try {
				await update.mutateAsync({
					id: user_id,
					stripe,
					...values
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
				notifyError('update-personal-failed', err?.error?.message ?? err.message, <IconX size={20} />);
			}
		},
		[form]
	);

	return (
		<form className='container py-5' onSubmit={form.onSubmit(handleSubmit)}>
			<Card shadow='sm' p='xl' radius='xs' className='w-1/2'>
				<Stack>
					<div className='flex flex-col'>
						<span>Company legal name</span>
						<DynamicInputField editMode={editMode} {...form.getInputProps('legal_name')} />
					</div>
					<div className='flex flex-col'>
						<span>Type of business</span>
						<DynamicInputField
							{...form.getInputProps('business_type')}
							editMode={editMode}
							is_business_type
						/>
					</div>
					<div className='flex flex-col'>
						<span>Type of industry</span>
						<DynamicInputField
							{...form.getInputProps('merchant_category_code')}
							editMode={editMode}
							is_merchant_code
						/>
					</div>
					<div className='flex flex-col'>
						<span>Company Reg No.</span>
						<DynamicInputField {...form.getInputProps('business_crn')} editMode={editMode} />
					</div>
					<div className='flex flex-col'>
						<span>Number of Vehicles</span>
						<DynamicInputField {...form.getInputProps('num_vehicles')} editMode={editMode} />
					</div>
					<div className='flex flex-col'>
						<span>Business URL</span>
						<DynamicInputField {...form.getInputProps('business_url')} editMode={editMode} />
					</div>
					<Group py='xs'>
						{editMode ? (
							<Button type='submit' disabled={!form.isDirty()} loading={loading}>
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

export default Company;
