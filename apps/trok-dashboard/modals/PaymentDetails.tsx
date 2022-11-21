import React from 'react';
import { Divider, Drawer, Stack, Textarea, Text } from '@mantine/core';
import { capitalize, sanitize } from '../utils/functions';
import dayjs from 'dayjs';
import { IconPencil } from '@tabler/icons';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { GBP } from '@trok-app/shared-utils';
import { Prisma } from '@prisma/client';
import { trpc } from '../utils/clients';

dayjs.extend(advancedFormat);

interface PaymentDetailsProps {
	opened: boolean;
	setOpened: (value: boolean) => void;
	payment: Prisma.PaymentUncheckedCreateInput;
}

const PaymentDetails = ({ opened, setOpened, payment }: PaymentDetailsProps) => {
	const { data: bankAccount } = trpc.getSingleBankAccount.useQuery(payment?.bankAccountId, {
		enabled: !!payment?.bankAccountId
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
					<span>
						Payment <span className='font-semibold'>{sanitize(payment?.status ?? 'in progress')}</span> to{' '}
						{payment?.recipient_name}
					</span>
					<span className='heading-1'>-{GBP(payment?.amount).format()}</span>
				</Stack>
				<Divider />
				<div className='flex flex-col space-y-12'>
					<Stack spacing='xs'>
						<span className='font-semibold'>Payment Type</span>
						{payment?.recurring ? (
							<div className='flex flex-col'>
								<span className="mb-2">Standing Order</span>
								<Text size="sm">Start Date: {dayjs.unix(payment?.schedule?.start_date).format("DD MMM")} - Billed {payment?.schedule?.interval}</Text>
								<Text size='sm' weight={500} className='w-72'>
									To manage this direct debit, please use your online / mobile banking app{' '}
								</Text>
							</div>
						) : (
							<span>{capitalize(sanitize(String(payment?.payment_type)))}</span>
						)}
					</Stack>
					<Stack spacing='xs'>
						<span className='font-semibold'>Payment Date</span>
						<span>{dayjs(payment?.created_at).format('HH:mm - Do MMM')}</span>
					</Stack>
					<Stack spacing='xs'>
						<span className='font-semibold'>Paid from</span>
						<span>
							{bankAccount?.bank_name} ({bankAccount?.sort_code})
						</span>
					</Stack>
				</div>
				<Divider />
				<div className='flex flex-col space-y-12'>
					<span>Add Memo</span>
				</div>
				<Textarea
					rightSection={<IconPencil size={16} color={'gray'} />}
					px={0}
					cols={1}
					radius={0}
					styles={{
						input: {
							border: 'none',
							borderBottom: '2px solid lightgray'
						}
					}}
				/>
			</Stack>
		</Drawer>
	);
};

export default PaymentDetails;
