import React from 'react';
import { Button, Drawer, Group, NumberInput, Stack, Switch, Text, Title } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';

export interface Limit {
	active: boolean;
	amount: number;
}

export interface SpendingLimitFormValues {
	per_authorization: Limit
	daily: Limit
	weekly: Limit
	monthly: Limit
}

interface SpendingLimitFormProps {
	opened: boolean;
	onClose: () => void;
	form: UseFormReturnType<SpendingLimitFormValues>
	loading: boolean
	onSubmit: (val: SpendingLimitFormValues) => Promise<void>
}

const SpendingLimitForm = ({opened, onClose, form, onSubmit, loading}: SpendingLimitFormProps) => {
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
					<span>Edit Spend Limits</span>
				</Title>
				<form onSubmit={form.onSubmit(onSubmit)} className='flex flex-col space-y-4'>
					<div className='flex items-center space-x-4'>
						<Switch
							onLabel='ON'
							offLabel='OFF'
							size='md'
							{...form.getInputProps('per_authorization.active', { type: 'checkbox' })}
						/>
						<NumberInput
							disabled={!form.values.per_authorization.active}
							classNames={{ root: 'w-full' }}
							label='Per Transaction Limit'
							parser={(value: string) => value.replace(/£\s?|(,*)/g, '')}
							formatter={value =>
								!Number.isNaN(parseFloat(value))
									? `£ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
									: '£ '
							}
							{...form.getInputProps('per_authorization.amount')}
						/>
					</div>
					<div className='flex items-center space-x-4'>
						<Switch
							onLabel='ON'
							offLabel='OFF'
							size='md'
							{...form.getInputProps('daily.active', { type: 'checkbox' })}
						/>
						<NumberInput
							disabled={!form.values.daily.active}
							classNames={{ root: 'w-full' }}
							label='Daily Spend Limit'
							parser={(value: string) => value.replace(/£\s?|(,*)/g, '')}
							formatter={value =>
								!Number.isNaN(parseFloat(value))
									? `£ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
									: '£ '
							}
							{...form.getInputProps('daily.amount')}
						/>
					</div>
					<div className='flex items-center space-x-4'>
						<Switch
							onLabel='ON'
							offLabel='OFF'
							size='md'
							{...form.getInputProps('weekly.active', { type: 'checkbox' })}
						/>
						<NumberInput
							disabled={!form.values.weekly.active}
							classNames={{ root: 'w-full' }}
							label='Weekly Spend Limit'
							parser={(value: string) => value.replace(/£\s?|(,*)/g, '')}
							formatter={value =>
								!Number.isNaN(parseFloat(value))
									? `£ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
									: '£ '
							}
							{...form.getInputProps('weekly.amount')}
						/>
					</div>
					<div className='flex items-center space-x-4'>
						<Switch
							onLabel='ON'
							offLabel='OFF'
							size='md'
							{...form.getInputProps('monthly.active', { type: 'checkbox' })}
						/>
						<NumberInput
							disabled={!form.values.monthly.active}
							classNames={{ root: 'w-full' }}
							label='Monthly Spend Limit'
							parser={(value: string) => value.replace(/£\s?|(,*)/g, '')}
							formatter={value =>
								!Number.isNaN(parseFloat(value))
									? `£ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
									: '£ '
							}
							{...form.getInputProps('monthly.amount')}
						/>
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

export default SpendingLimitForm;
