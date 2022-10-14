import React from 'react';
import { Button, Card, Group, Stack, Text } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { STORAGE_KEYS } from '../../utils/constants';

const Company = () => {
	const [business, setBusiness] = useLocalStorage({key: STORAGE_KEYS.COMPANY_FORM, defaultValue: null})
	return (
		<div className='container py-5'>
			<Card shadow='sm' p="xl" radius='xs' className="w-1/2">
				<Stack>
					<div className="flex flex-col">
						<span>Company legal name</span>
						<span className="font-semibold">{business?.legal_name}</span>
					</div>
					<div className="flex flex-col">
						<span>Type of business</span>
						<span className="font-semibold">{business?.business_type}</span>
					</div>
					<div className="flex flex-col">
						<span>Type of industry</span>
						<span className="font-semibold">{business?.industry_type}</span>
					</div>
					<div className="flex flex-col">
						<span>Company Reg No.</span>
						<span className="font-semibold">{business?.crn}</span>
					</div>
					<div className="flex flex-col">
						<span>Number of Vehicles</span>
						<span className="font-semibold">{business?.num_vehicles}</span>
					</div>
					<div className="flex flex-col">
						<span>Business URL</span>
						<span className="font-semibold">{business?.business_url || "N/Ac"}</span>
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

export default Company;
