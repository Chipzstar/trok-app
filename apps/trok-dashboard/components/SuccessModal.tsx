import { Modal } from '@mantine/core';
import React from 'react';

const SuccessModal = ({opened, onClose}) => {
	return (
		<Modal
			opened={opened}
			onClose={onClose}
			centered
			size="lg"
			title="Payment Succeeded"
			styles={{
				modal: {
					backgroundColor: 'lightgreen',
				},
				title: {
					fontWeight: 500,
					fontSize: 20
				}
			}}
		>
			Expect your payment to arrive within 2 hours
		</Modal>
	);
};

export default SuccessModal;
