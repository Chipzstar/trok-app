import React from 'react';
import { Card, Drawer, Group, ScrollArea, Stack, Text, Title } from '@mantine/core';
import { Prisma } from '@prisma/client';
import { GBP, sanitize, TRANSACTION_STATUS } from '@trok-app/shared-utils';
import dayjs from 'dayjs';
import { trpc } from '../utils/clients';
import useWindowSize from '../hooks/useWindowSize';

interface TransactionDetailsProps {
	opened: boolean;
	setOpened: (value: boolean) => void;
	transaction: Prisma.TransactionUncheckedCreateInput;
}

const TransactionDetails = ({ opened, setOpened, transaction }: TransactionDetailsProps) => {
	const { data: driver } = trpc.driver.getSingleDriver.useQuery(transaction?.driverId, {
		// The query will not execute until the userId exists
		enabled: !!transaction?.driverId
	});
	const { data: card } = trpc.card.getSingleCard.useQuery(transaction?.cardId, {
		// The query will not execute until the userId exists
		enabled: !!transaction?.cardId
	});
	const { height } = useWindowSize();

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
			<ScrollArea.Autosize maxHeight={height - 80} scrollHideDelay={0} type="never">
				<Stack justify='center'>
					<Stack spacing='xs'>
						<Group>
							<Title size={50}>{GBP(transaction?.transaction_amount).format()}</Title>
						</Group>
						<Text weight={500} color='dimmed'>
							{transaction?.merchant_data?.name} . {dayjs(transaction?.created_at).format('DD MMM YYYY')}
						</Text>
					</Stack>
					{transaction?.status === TRANSACTION_STATUS.DECLINED && (<div
						id='alert-additional-content-2'
						className='mb-4 rounded-lg border border-red-300 bg-red-50 p-4 dark:bg-red-100'
						role='alert'
					>
						<div className='flex items-center'>
							<svg
								aria-hidden='true'
								className='mr-2 h-5 w-5 text-red-900 dark:text-red-800'
								fill='currentColor'
								viewBox='0 0 20 20'
								xmlns='http://www.w3.org/2000/svg'
							>
								<path
									fillRule='evenodd'
									d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
									clipRule='evenodd'
								></path>
							</svg>
							<span className='sr-only'>Info</span>
							<h3 className='text-lg font-medium text-red-900 dark:text-red-800 capitalize'>
								{sanitize(String(transaction?.decline_code))}
							</h3>
						</div>
						<div className='mt-2 mb-4 text-sm text-red-900 dark:text-red-800'>
							{transaction?.decline_code === "disallowed_merchant" ? <span>{transaction?.decline_reason?.split(":")[0]} <span className="font-semibold">"{sanitize(String(transaction?.merchant_data.category))}"</span></span> : transaction?.decline_reason}
						</div>
					</div>)}
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
						<span className='text-sm'>
							{sanitize(String(transaction?.merchant_data.category))} (
							{transaction?.merchant_data.category_code})
						</span>
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
			</ScrollArea.Autosize>
		</Drawer>
	);
};

export default TransactionDetails;
