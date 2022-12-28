import React from 'react';
import { Drawer, Stack, Title } from '@mantine/core';

export type SectionState = 'Create Invoice' | 'Upload Invoice';
const InvoiceForm = ({opened, onClose, form, onSubmit, loading, section, setSection}) => {
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
					<span>Add New Invoice</span>
				</Title>
			</Stack>
		</Drawer>
	);
};

export default InvoiceForm;
