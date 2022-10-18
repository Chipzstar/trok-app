import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from '@mantine/form';
import { Button, Group, Loader, NumberInput, Stack, Text } from '@mantine/core';
import { Dropzone, PDF_MIME_TYPE } from '@mantine/dropzone';
import { IconCurrencyPound, IconFolders, IconUpload, IconX } from '@tabler/icons';
import { STORAGE_KEYS } from '../../utils/constants';
import { useLocalStorage } from '@mantine/hooks';
import axios from 'axios';
import { notifyError } from '@trok-app/shared-utils';

const ONE_GB = 1073741824; // in bytes units

const Step2 = ({ prevStep, nextStep }) => {
	const [loading, setLoading] = useState(false);
	const [account, setAccount] = useLocalStorage({ key: STORAGE_KEYS.ACCOUNT, defaultValue: null });
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
	const handleSubmit = useCallback(
		async values => {
			setLoading(false);
			try {
				const result = (
					await axios.post('/api/auth/onboarding', values, {
						params: {
							email: account?.email,
							step: 3
						}
					})
				).data;
				console.log('-----------------------------------------------');
				console.log(result);
				console.log('-----------------------------------------------');
				nextStep();
			} catch (err) {
				setLoading(false);
				console.error(err);
				notifyError('onboarding-step1-failure', err.error.message, <IconX size={20} />);
			}
		},
		[account?.email, nextStep]
	);

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
					label='What is your average monthly revenue?'
					min={100}
					max={1000000}
					step={100}
					icon={<IconCurrencyPound size={16} />}
					{...form.getInputProps('average_monthly_revenue')}
				/>
				<span className='text-center'>
					Can’t link your bank? Upload bank statements from the last three months.
				</span>
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
				<Group mt='md' position='apart'>
					<Button
						type="button"
						variant="white"
						size="md"
						onClick={prevStep}
					>
						<Text weight='normal'>Go Back</Text>
					</Button>
					<Button
						type='submit'
						variant='filled'
						size='md'
						style={{
							width: 200
						}}
					>
						<Loader size='sm' className={`mr-3 ${!loading && 'hidden'}`} color="white" />
						<Text weight='normal'>Continue</Text>
					</Button>
				</Group>
			</Stack>
		</form>
	);
};

export default Step2;
