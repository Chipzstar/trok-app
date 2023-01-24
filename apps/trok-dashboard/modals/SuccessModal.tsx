import { Dialog } from '@mantine/core';
import React from 'react';
import useWindowSize from '../hooks/useWindowSize';
import { IconCheck } from '@tabler/icons';

const SuccessModal = ({ opened, onClose }) => {
	const { width } = useWindowSize();
	return (
		<Dialog
			opened={opened}
			onClose={onClose}
			size='lg'
			p={0}
			transition='slide-up'
			transitionDuration={300}
			transitionTimingFunction='ease'
			position={{
				top: 20,
				left: Number(width / 2.5)
			}}
		>
			<div
				className='rounded-b border-t-4 border-teal-500 bg-teal-100 px-4 py-3 text-teal-900 shadow-md'
				role='alert'
			>
				<div className='flex'>
					<div className='mr-4 py-1'>
						<IconCheck size={20} />
					</div>
					<div>
						<p className='font-bold'>Payment Succeeded</p>
						<p className='text-sm'>Expect your payment to arrive within 2 hours</p>
					</div>
				</div>
			</div>
		</Dialog>
	);
};

export default SuccessModal;
