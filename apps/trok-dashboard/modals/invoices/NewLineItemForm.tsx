import React, { useEffect } from 'react';
import { Button, Group, Modal, NumberInput, Stack, Text, Textarea, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';

export interface LineItemFormValues {
	name: string;
	description?: string;
	price: number;
}
interface NewLineItemFormProps {
	opened: boolean;
	onClose: () => void;
	onSubmit: (values: LineItemFormValues) => Promise<void>;
	loading: boolean;
	query?: string | null
}
const NewLineItemForm = ({opened, onClose, onSubmit, loading, query=""} : NewLineItemFormProps) => {
	const form = useForm<LineItemFormValues>({
		initialValues: {
			name: query,
			price: 0,
			description: '',
		}
	});

	useEffect(() => form.reset(), [query]);

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			centered
			padding='lg'
			size='lg'
			title='Add New Item'
			styles={{
				title: {
					fontSize: 24,
					fontWeight: 500
				},
				header: {
					paddingBottom: 8,
					borderBottom: '1px solid #E5E5E5'
				}
			}}
		>
			<form onSubmit={form.onSubmit(onSubmit)} className='flex flex-col space-y-4'>
				<Stack>
					<TextInput
						label="Item Name"
						required
						{...form.getInputProps('name')}
					/>
					<NumberInput
						required
						withAsterisk
						label="Price"
						precision={2}
						min={1}
						max={10000}
						parser={value => value.replace(/£\s?|(,*)/g, '')}
						formatter={value =>
							!Number.isNaN(parseFloat(value))
								? `£ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
								: '£ '
						}
						{...form.getInputProps('price')}
					/>
					<Textarea
						label="Description"
						minRows={3}
						{...form.getInputProps('description')}
					/>
				</Stack>
				<Group position='right'>
					<Button variant="outline" type='button' onClick={onClose} styles={{
						root: {
							width: 90,
						}
					}}>
						<Text weight={500}>Cancel</Text>
					</Button>
					<Button disabled={!form.isDirty()} type='submit' loading={loading} styles={{
						root: {
							width: 90,
						}
					}}>
						<Text weight={500}>Save</Text>
					</Button>
				</Group>
			</form>
		</Modal>
	);
};

export default NewLineItemForm;
