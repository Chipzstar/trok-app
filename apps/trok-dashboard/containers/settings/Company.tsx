import React, { useState } from 'react';
import { Button, Card, Group, Stack, Text, TextInput } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { STORAGE_KEYS } from '../../utils/constants';

const DynamicInputField = ({ editMode, value }) => {
	return editMode ? (
		<TextInput defaultValue={value} />
	) : (
		<span className='font-semibold'>{value}</span>
	);
};

const Company = () => {
	const [business, setBusiness] = useLocalStorage({ key: STORAGE_KEYS.COMPANY_FORM, defaultValue: null })
	const [editMode, setEditMode] = useState(false);

	const toggleEditMode = () => setEditMode(!editMode);
	return (
		<div className='container py-5'>
			<Card shadow='sm' p='xl' radius='xs' className='w-1/2'>
				<Stack>
					<div className='flex flex-col'>
						<span>Company legal name</span>
						<DynamicInputField value={business?.legal_name} editMode={editMode} />
					</div>
					<div className='flex flex-col'>
						<span>Type of business</span>
						<DynamicInputField value={business?.business_type} editMode={editMode} />
					</div>
					<div className='flex flex-col'>
						<span>Type of industry</span>
						<DynamicInputField value={business?.industry_type} editMode={editMode} />
					</div>
					<div className='flex flex-col'>
						<span>Company Reg No.</span>
						<DynamicInputField value={business?.crn} editMode={editMode} />
					</div>
					<div className='flex flex-col'>
						<span>Number of Vehicles</span>
						<DynamicInputField value={business?.num_vehicles} editMode={editMode} />
					</div>
					<div className='flex flex-col'>
						<span>Business URL</span>
						<DynamicInputField value={business?.business_url || 'N/A'} editMode={editMode} />
					</div>
					<Group py='xs'>
						<Button onClick={toggleEditMode}>
							<Text weight='normal'>{editMode ? 'Save' : 'Edit'}</Text>
						</Button>
					</Group>
				</Stack>
			</Card>
		</div>
	);
};

export default Company;
