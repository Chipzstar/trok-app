import React, { useCallback, useEffect } from 'react';
import { useForm } from '@mantine/form';
import { Button, Group, NumberInput, Stack, Text } from '@mantine/core';
import { Dropzone, PDF_MIME_TYPE } from '@mantine/dropzone';
import { IconCurrencyPound, IconFolders, IconUpload, IconX } from '@tabler/icons';
import { STORAGE_KEYS } from '../utils/constants';
import { useLocalStorage } from '@mantine/hooks';

const ONE_GB = 1073741824; // in bytes units

const Step2 = ({nextStep}) => {
	const [financialForm, setFinancialForm] = useLocalStorage({
		key: STORAGE_KEYS.FINANCIAL_FORM,
		defaultValue: {
			average_monthly_revenue: null
		}
	});
	const form = useForm({
		initialValues: {
			...financialForm
		}
	});
	const handleSubmit = useCallback(values => {
		console.log(values)
		nextStep()
	}, []);

	useEffect(() => {
		const storedValue = window.localStorage.getItem(STORAGE_KEYS.FINANCIAL_FORM);
		if (storedValue) {
			try {
				form.setValues(JSON.parse(window.localStorage.getItem(STORAGE_KEYS.FINANCIAL_FORM)));
			} catch (e) {
				console.log('Failed to parse stored value');
				console.error(e);
			}
		}
	}, []);

	useEffect(() => {
		window.localStorage.setItem(STORAGE_KEYS.FINANCIAL_FORM, JSON.stringify(form.values));
	}, [form.values]);

	return (
		<form onSubmit={form.onSubmit(handleSubmit)} className='flex h-full w-full flex-col'>
			<h1 className='mb-4 text-2xl font-medium'>Your finances</h1>
			<Stack>
				<NumberInput
					required
					icon={<IconCurrencyPound size={16} />}
					label='What is your average monthly revenue?'
					{...form.getInputProps('average_monthly_revenue')}
				/>
				<span>Get the best out of the credit limit by linking your business’s primary bank account</span>
				<div className='flex flex-row flex-col items-center justify-center space-y-4'>
					<Button px='xl' fullWidth>
						<Text weight='normal'>Link Business Bank Account</Text>
					</Button>
					<Text align='center' size='xs' color='dimmed'>
						Trok uses Plaid for a safe & secure connection
						<br />
						Recommended for instant approval
					</Text>
				</div>

				<span className="text-center">Can’t link your bank? Upload bank statements from the last three months.</span>
				<Dropzone
					onDrop={files => console.log('accepted files', files)}
					onReject={files => console.log('rejected files', files)}
					maxSize={ONE_GB} // 1GB
					multiple
					accept={PDF_MIME_TYPE}
				>
					<Group position='center' spacing='xl' style={{ minHeight: 100, pointerEvents: 'none' }}>
						<Dropzone.Accept>
							<IconUpload size={50} stroke={1.5} />
						</Dropzone.Accept>
						<Dropzone.Reject>
							<IconX size={50} stroke={1.5} />
						</Dropzone.Reject>
						<Dropzone.Idle>
							<IconFolders size={40} stroke={1.5} />
						</Dropzone.Idle>
						<div>
							<Text size='xl' inline>
								Upload bank statements
							</Text>
							<Text size='xs' color='dimmed' mt={7} className='md:w-80'>
								PDF format required. Uploading bank statements may increase processing time for your
								application
							</Text>
						</div>
					</Group>
				</Dropzone>
				<Group mt='md' position="right">
					<Button
						type='submit'
						variant='filled'
						size='md'
						style={{
							width: 200
						}}
					>
						<Text weight="normal">Continue</Text>
					</Button>
				</Group>
			</Stack>
		</form>
	);
};

export default Step2;
