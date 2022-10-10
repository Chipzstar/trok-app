import React, { useCallback } from 'react';
import { useForm } from '@mantine/form';
import { Button, Group, NumberInput, Select, Stack, Text, TextInput } from '@mantine/core';
import { IconCurrencyPound, IconPhoto, IconUpload, IconX } from '@tabler/icons';
import { Dropzone, MIME_TYPES } from '@mantine/dropzone';

const Step2 = () => {
	const form = useForm({
		initialValues: {
			legal_name: '',
			weekly_fuel_spend: '',
			business_type: '',
			industry_type: '',
			business_crn: '',
			company_url: '',
			num_vehicles: null
		}
	});

	const handleSubmit = useCallback((values) => {
			alert(values);
		},
		[]
	);

	return (
		<form onSubmit={form.onSubmit(handleSubmit)} className='h-full w-full flex'>
			<Stack className="w-2/3 mx-auto">
				<TextInput
					required
					label='Company Legal Name'
					placeholder='Your company name'
					{...form.getInputProps('legal_name')}

				/>
				<TextInput
					required
					label='Weekly Fuel and Maintenance Spend'
					placeholder='100'
					icon={<IconCurrencyPound size={16} />}
					{...form.getInputProps('weekly_fuel_spend')}
				/>
				<Group grow>
					<Select
						required
						label='Type of Business'
						placeholder='Your Business Type'
						{...form.getInputProps('business_type')}
						data={['LLC', 'Private Company', 'Public Company', 'Non Profit Organization', 'LLP', 'Other']}

					/>
					<Select
						required
						label='Type of Industry'
						placeholder='Your Industry Type'
						{...form.getInputProps('industry_type')}
						data={['Transportation - Other', 'Transportation - Motor Freight, Carriers & Trucking', 'Other']}
					/>
				</Group>
				<Group grow>
					<TextInput
						type='number'
						minLength={8}
						maxLength={8}
						required
						label='Company Registration Number'
						placeholder='CRN'
						{...form.getInputProps('crn')}
					/>
					<NumberInput
						label='Number of Vehicles'
						placeholder='30'
						required
						{...form.getInputProps('num_vehicles')}
					/>
				</Group>
				<TextInput
					type='text'
					label='Business URL'
					placeholder='Business URL'
					{...form.getInputProps('url')}
				/>
				<Dropzone
					onDrop={(files) => console.log('accepted files', files)}
					onReject={(files) => console.log('rejected files', files)}
					maxSize={3 * 1024 ** 2}
					accept={[MIME_TYPES.png, MIME_TYPES.jpeg, MIME_TYPES.pdf]}
				>
					<Group position='center' spacing='xl' style={{ minHeight: 100, pointerEvents: 'none' }}>
						<Dropzone.Accept>
							<IconUpload
								size={50}
								stroke={1.5}
							/>
						</Dropzone.Accept>
						<Dropzone.Reject>
							<IconX
								size={50}
								stroke={1.5}
							/>
						</Dropzone.Reject>
						<Dropzone.Idle>
							<IconPhoto size={50} stroke={1.5} />
						</Dropzone.Idle>

						<div>
							<Text size='xl' inline>
								Upload front of Driver's License
							</Text>
							<Text size='sm' color='dimmed' inline mt={7}>
								We need this to verify your identity
							</Text>
						</div>
					</Group>
				</Dropzone>
				<Group grow mt='lg'>
					<Button type='submit' variant='filled' color='dark' size='lg' classNames={{
						root: 'bg-black w-full'
					}}>
						Continue
					</Button>
				</Group>
			</Stack>
		</form>

	);
};

export default Step2;
