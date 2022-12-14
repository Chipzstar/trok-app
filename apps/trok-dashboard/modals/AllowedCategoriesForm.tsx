import React from 'react';
import { Drawer, Select, Stack, Switch, Title, Text, Button, Group } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import Prisma from '@prisma/client';

export interface AllowedCategoriesFormValues {
	fuel: Prisma.MerchantCodeInfo;
	truck_stops: Prisma.MerchantCodeInfo;
	repair: Prisma.MerchantCodeInfo;
	hotels: Prisma.MerchantCodeInfo;
	tolls: Prisma.MerchantCodeInfo;
}

export interface AllowedCategoriesFormProps {
	opened: boolean;
	onClose: () => void;
	form: UseFormReturnType<AllowedCategoriesFormValues>;
	loading: boolean;
	onSubmit: (val: AllowedCategoriesFormValues) => Promise<void>;
}

const AllowedCategoriesForm = ({ opened, onClose, form, loading, onSubmit }: AllowedCategoriesFormProps) => {
	return (
		<Drawer
			opened={opened}
			onClose={onClose}
			padding='xl'
			size='xl'
			position='right'
			classNames={{
				drawer: 'flex h-full'
			}}
		>
			<Stack>
				<Title order={2} weight={500}>
					<span>Edit Allowed Categories</span>
				</Title>
				<form onSubmit={form.onSubmit(onSubmit)} className='flex flex-col space-y-4'>
					<div className='flex items-center space-x-4'>
						<Switch
							onLabel='ON'
							offLabel='OFF'
							size='md'
							{...form.getInputProps('fuel.enabled', { type: 'checkbox' })}
						/>
						<Text size='lg'>Fuel</Text>
					</div>
					<div className='flex items-center space-x-4'>
						<Switch
							onLabel='ON'
							offLabel='OFF'
							size='md'
							{...form.getInputProps('truck_stops.enabled', { type: 'checkbox' })}
						/>
						<Text size='lg'>Truck Stops</Text>
					</div>
					<div className='flex items-center space-x-4'>
						<Switch
							onLabel='ON'
							offLabel='OFF'
							size='md'
							{...form.getInputProps('repair.enabled', { type: 'checkbox' })}
						/>
						<Text size='lg'>Repairs</Text>
					</div>
					<div className='flex items-center space-x-4'>
						<Switch
							onLabel='ON'
							offLabel='OFF'
							size='md'
							{...form.getInputProps('hotels.enabled', { type: 'checkbox' })}
						/>
						<Text size='lg'>Hotels</Text>
					</div>
					<div className='flex items-center space-x-4'>
						<Switch
							onLabel='ON'
							offLabel='OFF'
							size='md'
							{...form.getInputProps('tolls.enabled', { type: 'checkbox' })}
						/>
						<Text size='lg'>Tolls</Text>
					</div>
					<Group py='xl' position='right'>
						<Button
							type='submit'
							styles={{
								root: {
									width: 120
								}
							}}
							loading={loading}
						>
							<Text weight={500}>Save</Text>
						</Button>
					</Group>
				</form>
			</Stack>
		</Drawer>
	);
};

export default AllowedCategoriesForm;
