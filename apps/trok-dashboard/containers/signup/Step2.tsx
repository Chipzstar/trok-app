import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from '@mantine/form';
import { Button, Group, Loader, NumberInput, Stack, Text } from '@mantine/core';
import { Dropzone, FileWithPath, PDF_MIME_TYPE } from '@mantine/dropzone';
import { IconCurrencyPound, IconFiles, IconUpload, IconX } from '@tabler/icons';
import { STORAGE_KEYS } from '../../utils/constants';
import { useListState, useLocalStorage } from '@mantine/hooks';
import { notifyError, OnboardingBusinessInfo } from '@trok-app/shared-utils';
import { apiClient } from '../../utils/clients';
import { uploadFile } from '../../utils/functions';

const ONE_GB = 1073741824; // in bytes units

const DocumentInfo = ({ files }: { files: FileWithPath[] }) => {
	return (
		<Stack spacing="xs">
			{files.map((file, index) => (
				<Group key={index}>
					<Text size='sm'>{file?.name}</Text>
					<Text size='sm' color='dimmed'>
						({file?.size / 1000} Kb)
					</Text>
				</Group>
			))}
		</Stack>
	);
};

const Step2 = ({ prevStep, nextStep }) => {
	const openRef = useRef<() => void>(null);
	const [files, handlers] = useListState<FileWithPath>([]);
	const [loading, setLoading] = useState(false);
	const [account, setAccount] = useLocalStorage({ key: STORAGE_KEYS.ACCOUNT, defaultValue: null });
	const [business, setBusiness] = useLocalStorage<OnboardingBusinessInfo>({ key: STORAGE_KEYS.COMPANY_FORM, defaultValue: null });
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
			setLoading(true);
			try {
				if (files.length < 3) {
					throw new Error("Please upload 3 bank statements from the last 3 months")
				}
				await Promise.all(files.map(file => uploadFile(file, business.business_crn, "BANK_STATEMENTS")))
				const result = (
					await apiClient.post('/server/auth/onboarding', values, {
						params: {
							email: account?.email,
							step: 3
						}
					})
				).data;
				console.log('-----------------------------------------------');
				console.log(result);
				console.log('-----------------------------------------------');
				setAccount({ ...account, business: { ...account.business, ...values } });
				setLoading(false);
				nextStep();
			} catch (err) {
				setLoading(false);
				console.error(err);
				notifyError('onboarding-step1-failure', err?.error?.message ?? err.message, <IconX size={20} />);
			}
		},
		[account, business, files, nextStep, setAccount]
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
					required
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
					openRef={openRef}
					onDrop={newFiles => {
						console.log('accepted files', newFiles);
						handlers.append(...newFiles);
					}}
					maxFiles={3}
					onReject={files => {
						console.log('rejected files', files)
						notifyError('rejected-files', files[0].errors[0].message, <IconX size={20}/>)
					}}
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
							{files.length ? (
								<DocumentInfo files={files} />
							) : (
								<Group>
									<IconFiles size={40} stroke={1.5} />
									<div>
										<Text size='xl' inline>
											Upload bank statements
										</Text>
										<Text size='xs' color='dimmed' mt={7} className='md:w-80'>
											PDF format required. Uploading bank statements may increase processing time
											for your application
										</Text>
									</div>
								</Group>
							)}
						</Dropzone.Idle>
					</Group>
				</Dropzone>
				<Group position="center">
					<Button size="xs" color="red" variant="outline" onClick={() => handlers.setState([])}>Remove All</Button>
					<Button disabled={files.length >= 3} size="xs" variant="outline" onClick={() => openRef.current()}>{files.length ? "Add more" : "Select files"}</Button>
				</Group>
				<Group mt='md' position='apart'>
					<Button type='button' variant='white' size='md' onClick={prevStep}>
						<Text weight='normal'>Go Back</Text>
					</Button>
					<Button
						type='submit'
						variant='filled'
						size='md'
						style={{
							width: 200
						}}
						loading={loading}
					>
						<Text weight='normal'>Continue</Text>
					</Button>
				</Group>
			</Stack>
		</form>
	);
};

export default Step2;
