import React from 'react';
import { Dialog, Stack, Title, Text } from '@mantine/core';
import useWindowSize from '../hooks/useWindowSize';
import Image from 'next/image';

const ComingSoon = ({ opened, onClose }) => {
	const { width, height } = useWindowSize();
	return (
		<Dialog
			opened={opened}
			onClose={onClose}
			size='xl'
			p='xs'
			transition='fade'
			transitionDuration={300}
			transitionTimingFunction='ease'
			position={{
				top: Number(height / 3),
				left: Number(width / 2.5)
			}}
		>
			<Stack justify='center' spacing={0} px="md">
				<Title align='center' weight={500}>Fuel Credit Coming Soon</Title>
				<div className='flex grow items-center justify-center ml-4'>
					<Image src='/static/images/coming-soon.svg' height={200} width={300} />
				</div>
				<Text align="center">No fees. No credit limit. No personal guarantee required.</Text>
				<Text align="center"size="xs">We are currently seeking regulatory approval from the Financial Conduct Authority to offer credit.</Text>
			</Stack>
		</Dialog>
	);
};

export default ComingSoon;
