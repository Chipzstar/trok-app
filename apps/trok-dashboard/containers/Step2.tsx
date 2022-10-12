import React, { useCallback, useState } from 'react';
import { useForm } from '@mantine/form';
import { Button, FileButton, Group, NumberInput, Select, Stack, Text, TextInput } from '@mantine/core';
import { IconCurrencyPound, IconPhoto, IconUpload, IconX } from '@tabler/icons';
import { Dropzone, MIME_TYPES } from '@mantine/dropzone';

const Step2 = () => {
	const [files, setFiles] = useState<File>(null);
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

	const handleSubmit = useCallback(values => {
		alert(values);
	}, []);

	return (
		<form onSubmit={form.onSubmit(handleSubmit)} className='flex h-full w-full flex-col'>
			<h1 className='mb-4 text-2xl font-medium'>Your company</h1>
			<Stack>
				<TextInput required label='Company legal name' {...form.getInputProps('legal_name')} />
				<TextInput
					required
					label='Weekly fuel and maintenance spend'
					icon={<IconCurrencyPound size={16} />}
					{...form.getInputProps('weekly_fuel_spend')}
				/>
				<Group grow>
					<Select
						required
						label='Type of business'
						{...form.getInputProps('business_type')}
						data={['LLC', 'Private Company', 'Public Company', 'Non Profit Organization', 'LLP', 'Other']}
					/>
					<Select
						required
						label='Type of industry'
						{...form.getInputProps('industry_type')}
						data={[
							'Transportation - Other',
							'Transportation - Motor Freight, Carriers & Trucking',
							'Other'
						]}
					/>
				</Group>
				<Group grow>
					<TextInput
						type='number'
						minLength={8}
						maxLength={8}
						required
						label='Company Reg No.'
						{...form.getInputProps('crn')}
					/>
					<NumberInput label='Number of Vehicles' required {...form.getInputProps('num_vehicles')} />
				</Group>
				<TextInput type='text' label='Business URL' {...form.getInputProps('url')} />
				<div>
					<Text size='md'>Upload front of Driver's License</Text>
					<FileButton onChange={setFiles} accept='image/png,image/jpeg'>
						{props => <Button variant="outline" fullWidth {...props}>Upload picture</Button>}
					</FileButton>
				</div>
				{/*<Dropzone
					onDrop={(files) => console.log('accepted files', files)}
					onReject={(files) => console.log('rejected files', files)}
					maxSize={3 * 1024 ** 2}
					accept={[MIME_TYPES.png, MIME_TYPES.jpeg, MIME_TYPES.pdf]}
				>
					<Group position='center' spacing='xl' style={{ minHeight: 80, pointerEvents: 'none' }}>
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
							<IconPhoto size={30} stroke={1.5} />
						</Dropzone.Idle>

						<div>
							<Text size='xl' inline>
								Upload picture
							</Text>
						</div>
					</Group>
				</Dropzone>*/}
				<Group position='right'>
					<Button
						type='submit'
						variant='filled'
						size='md'
						style={{
							width: 200
						}}
					>
						Continue
					</Button>
				</Group>
			</Stack>
		</form>
	);
};

export default Step2;
