import React from 'react';
import { Drawer, Stack, Text, Title, Card, Group } from '@mantine/core';
import { Prisma } from '@prisma/client';
import { GBP } from '@trok-app/shared-utils';
import dayjs from 'dayjs';
import { trpc } from '../utils/clients';
import { sanitize } from '../utils/functions';

interface TransactionDetailsProps {
	opened: boolean;
	setOpened: (value: boolean) => void;
	transaction: Prisma.TransactionUncheckedCreateInput;
}

const TransactionDetails = ({ opened, setOpened, transaction }: TransactionDetailsProps) => {
	const { data: driver } = trpc.getSingleDriver.useQuery(transaction?.driverId, {
		// The query will not execute until the userId exists
		enabled: !!transaction?.driverId
	});
	const { data: card } = trpc.getSingleCard.useQuery(transaction?.cardId, {
		// The query will not execute until the userId exists
		enabled: !!transaction?.cardId
	});

	return (
		<Drawer
			opened={opened}
			onClose={() => setOpened(false)}
			padding='xl'
			size='xl'
			position='right'
			classNames={{
				drawer: 'flex h-full'
			}}
		>
			<Stack justify='center'>
				<Stack spacing='xs'>
					<Title size={50}>{GBP(transaction?.transaction_amount).format()}</Title>
					<Text weight={500} color='dimmed'>
						{transaction?.merchant_data.name} . {dayjs(transaction?.created_at).format('DD MMM YYYY')}
					</Text>
				</Stack>
				<Text size='sm' color='dimmed'>
					Transaction Details
				</Text>
				<Card shadow='sm' p='lg' radius='md' withBorder>
					<Stack>
						<div className='flex flex-col'>
							<span>{transaction?.cardholder_name}</span>
							<span className='text-sm text-gray-500'>{driver?.email}</span>
						</div>
						<div className='flex flex-col'>
							<span>Physical card from {driver?.firstname}</span>
							<span className='text-sm text-gray-500'>Physical Card . **** {card?.last4}</span>
						</div>
					</Stack>
				</Card>
				<Text size='sm' color='dimmed'>
					Transaction ID
				</Text>
				<Card shadow='sm' p='sm' radius='md' withBorder>
					<span className='text-sm'>{transaction?.authorization_id}</span>
				</Card>
				<Text size='sm' color='dimmed'>
					Category
				</Text>
				<Card shadow='sm' p='sm' radius='md' withBorder>
					<span className='text-sm'>{sanitize(String(transaction?.merchant_data.category))} ({transaction?.merchant_data.category_code})</span>
				</Card>
				<Text size='sm' color='dimmed'>
					Receipt
				</Text>
				<Card shadow='sm' p='sm' radius='md' withBorder>
					<Stack spacing={0}>
						<span className='text-sm'>Fuel Type: {transaction?.purchase_details?.fuel_type}</span>
						<span className='text-sm'>Litres: {transaction?.purchase_details?.volume}</span>
						<span className='text-sm'>
							Price per litre: {transaction?.purchase_details?.unit_cost_decimal}
						</span>
					</Stack>
				</Card>
			</Stack>
		</Drawer>
	);
};

export default TransactionDetails;
