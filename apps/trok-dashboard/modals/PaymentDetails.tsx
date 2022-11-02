import React from 'react';
import { Divider, Drawer, Stack, Textarea } from '@mantine/core';
import { capitalize, sanitize } from '../utils/functions';
import { GBP } from '../utils/constants';
import dayjs from 'dayjs';
import { IconPencil } from '@tabler/icons';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat)

const PaymentDetails = ({opened, setOpened, payment}) => {
	return (
		<Drawer opened={opened} onClose={() => setOpened(false)} padding="xl" size='xl' position='right' classNames={{
			drawer: 'flex h-full'
		}}>
			<Stack justify="center">
				<Stack spacing='xs'>
					<span>Payment <span className="font-semibold">{sanitize(payment?.status ?? "in progress")}</span> to {payment?.recipient?.name}</span>
					<span className='heading-1'>-{GBP(payment?.amount).format()}</span>
				</Stack>
				<Divider />
				<div className='flex flex-col space-y-12'>
					<Stack spacing='xs'>
						<span className="font-semibold">Payment Type</span>
						<span>{capitalize(sanitize(payment?.payment_type ?? ""))}</span>
					</Stack>
					<Stack spacing='xs'>
						<span className="font-semibold">Payment Date</span>
						<span>{dayjs(payment?.created_at).format("HH:mm - Do MMM")}</span>
					</Stack>
					<Stack spacing='xs'>
						<span className="font-semibold">Payroll Period</span>
						<span>Sept 15 - Sept 30</span>
					</Stack>
				</div>
				<Divider />
				<div className='flex flex-col space-y-12'>
					<span>Add Memo</span>
				</div>
				<Textarea
					rightSection={<IconPencil size={16} color={"gray"}/>}
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
