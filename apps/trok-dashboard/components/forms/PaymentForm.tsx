import React from 'react';
import { Button, Drawer, Group, NumberInput, SegmentedControl, Stack, Text, TextInput, Title } from '@mantine/core';
import SortCodeInput from '../SortCodeInput';

const PaymentForm = ({ opened, onClose, onSubmit, form, section, setSection, loading }) => {
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
					<span>Send Payment</span>
				</Title>
				<form onSubmit={form.onSubmit(onSubmit)} className='flex flex-col space-y-4'>
					<SegmentedControl
						value={section}
						onChange={(value: 'topup' | 'account') => setSection(value)}
						transitionTimingFunction='ease'
						fullWidth
						data={[
							{ label: 'Top Up', value: 'topup' },
							{ label: 'Account', value: 'account' }
						]}
					/>
					{section === 'account' && (
						<>
							<TextInput required label='Send To' {...form.getInputProps('account_holder_name')} />
							<Group grow spacing='xl'>
								<TextInput required label='Account Number' {...form.getInputProps('account_number')} />
								<SortCodeInput
									onChange={event => {
										console.log(event.currentTarget.value);
										form.setFieldValue('sort_code', event.currentTarget.value);
									}}
									value={form.values.sort_code}
									required
								/>
							</Group>
						</>
					)}

					<NumberInput
						required
						precision={2}
						type='text'
						label='Amount'
						min={100}
						max={1000000}
						step={100}
						parser={value => value.replace(/£\s?|(,*)/g, '')}
						formatter={value =>
							!Number.isNaN(parseFloat(value)) ? `£ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '£ '
						}
						{...form.getInputProps('amount')}
					/>
					<TextInput
						required
						minLength={1}
						maxLength={18}
						label='Reference'
						{...form.getInputProps('reference')}
					/>
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

							<Text weight={500}>Send</Text>
						</Button>
					</Group>
				</form>
			</Stack>
		</Drawer>
	);
};

export default PaymentForm;
