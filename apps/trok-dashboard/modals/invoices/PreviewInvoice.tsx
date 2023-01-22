import React from 'react';
import { InvoiceFormValues } from '../../utils/types';
import { UseFormReturnType } from '@mantine/form';
import { SendInvoiceFormValues } from './SendInvoiceForm';
import { Modal } from '@mantine/core';

interface Props {
	opened: boolean;
	onClose: () => void;
	form: UseFormReturnType<SendInvoiceFormValues>;
	FORM: UseFormReturnType<InvoiceFormValues>;
}

const PreviewInvoice = ({opened, onClose, form, FORM}: Props) => {
	return (
		<Modal
			opened={opened}
			onClose={onClose}
			centered
			padding='lg'
			size='xl'
			title='Send Invoice'
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

		</Modal>
	);
};

export default PreviewInvoice;
