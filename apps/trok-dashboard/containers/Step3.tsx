import React, { useCallback } from 'react';
import { useForm } from '@mantine/form';
import { Button, Group, NumberInput, Stack, Text } from '@mantine/core';
import { Dropzone, MIME_TYPES } from '@mantine/dropzone';
import { IconCurrencyPound, IconFolders, IconUpload, IconX } from '@tabler/icons';

const Step3 = () => {
	const form = useForm({
		initialValues: {
			average_monthly_revenue: null
		}
	});
	const handleSubmit = useCallback((values) => {
			alert(values);
		},
		[]
	);

	return (
		<form onSubmit={form.onSubmit(handleSubmit)} className='h-full w-full flex flex-col'>
			<h1 className="text-2xl text-center font-semibold mb-4">Tell us about your finances</h1>
			<Stack className="mx-auto my-auto">
				<NumberInput
					required
					icon={<IconCurrencyPound size={16} />}
					label='What is your average monthly revenue?'
					placeholder='0'
					{...form.getInputProps('average_monthly_revenue')}
				/>
				<div className='flex flex-col items-center justify-center flex-row space-y-4'>
					<Button color='green' px="xl">
						Link Business Bank Account
					</Button>
					<Text align='center' size='xs' color='dimmed'>Trok uses Plaid for a safe & secure connection<br />Recommended
						for instant approval</Text>
				</div>
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
							<IconFolders size={40} stroke={1.5} />
						</Dropzone.Idle>
						<div>
							<Text size='xl' inline>
								Upload bank statements
							</Text>
							<Text size='xs' color='dimmed' mt={7} className="md:w-80">
								PDF format required. Uploading bank statements may increase processing time for your application
							</Text>
						</div>
					</Group>
				</Dropzone>
				<Group grow mt="lg">
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

export default Step3;