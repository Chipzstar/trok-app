import React, { useMemo } from 'react';
import PageContainer from '../../layout/PageContainer';
import { Button, Group, Title, Card, Stack, Text, ActionIcon } from '@mantine/core';
import { IconChevronLeft, IconEdit } from '@tabler/icons';
import { useRouter } from 'next/router';
import { SAMPLE_CARDS, SAMPLE_TRANSACTIONS } from '../../utils/constants';
import TransactionTable from '../../containers/TransactionTable';
import dayjs from 'dayjs';

const rows = SAMPLE_TRANSACTIONS.slice(0, 3).map((element, index) => {
	return (
		<tr
			key={index}
			style={{
				border: 'none'
			}}
		>
			<td colSpan={1}>
				<span>{dayjs.unix(element.date_of_transaction).format('MMM DD HH:mma')}</span>
			</td>
			<td colSpan={1}>
				<span>{element.merchant}</span>
			</td>
			<td colSpan={1}>
				<div className='flex flex-shrink flex-col'>
					<span>{element.location}</span>
				</div>
			</td>
			<td colSpan={1}>
				<span>{element.last4}</span>
			</td>
			<td colSpan={1}>
				<Text weight={500}>{element.driver}</Text>
			</td>
			<td colSpan={1}>
				<span className='text-base font-normal'>£{element.amount / 100}</span>
			</td>
			<td colSpan={1}>
				<span>£{element.net_discount / 100}</span>
			</td>
			<td colSpan={1}>
				<span>{element.type}</span>
			</td>
			<td colSpan={1}>
				<span>{element.litres}</span>
			</td>
			<td colSpan={1}>
				<span>£{element.price_per_litre / 100}p</span>
			</td>
		</tr>
	);
});

const CardDetails = () => {
	const router = useRouter();
	const { cardID } = router.query;

	const card = useMemo(() => {
		return SAMPLE_CARDS.find(c => c.id === cardID);
	}, [cardID]);

	return (
		<PageContainer
			header={
				<PageContainer.Header>
					<Button leftIcon={<IconChevronLeft />} variant='white' color='dark' onClick={() => router.back()}>
						<span className='text-xl font-medium'>Back</span>
					</Button>
				</PageContainer.Header>
			}
		>
			<PageContainer.Body extraClassNames='px-10'>
				<Group className='pb-6'>
					<Title order={1} weight={500}>
						Card **** {card.last4}
					</Title>
					<span className='font-medium uppercase text-success'>{card.status}</span>
				</Group>
				<div className='grid grid-cols-1 gap-x-8 md:grid-cols-2'>
					<Card shadow='sm' p='lg' radius='md' withBorder>
						<Group position='apart'>
							<Stack>
								<Text color='dimmed' transform='uppercase'>
									Spending Limit
								</Text>
								<span>Per Transaction</span>
								<span>Daily</span>
								<span>Weekly</span>
							</Stack>
							<Stack>
								<div className='flex items-center'>
									<Text>Edit Spend Limits &nbsp;</Text>
									<ActionIcon size='sm'>
										<IconEdit />
									</ActionIcon>
								</div>
								<span>-</span>
								<span>£2000</span>
								<span>£6000</span>
							</Stack>
						</Group>
					</Card>
					<Card shadow='sm' p='lg' radius='md' withBorder>
						<Stack justify='space-between' className='h-full'>
							<div className='space-y-2'>
								<Text weight={600}>Driver</Text>
								<span>John Smith</span>
							</div>
							<div className='flex-end block'>
								<Button size='md'>Disable Card</Button>
							</div>
						</Stack>
					</Card>
				</div>
				<Title order={1} weight={500} py='xl'>
					Recent Transactions
				</Title>
				<div>
					<TransactionTable rows={rows} spacingY="sm" />
				</div>
			</PageContainer.Body>
		</PageContainer>
	);
};

export default CardDetails;
