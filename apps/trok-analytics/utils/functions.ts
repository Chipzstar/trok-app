import Prisma from '@prisma/client';
import dayjs from 'dayjs';
import { TRANSACTION_STATUS } from '@trok-app/shared-utils';

export function filterByTimeRange(data: Prisma.Transaction[], range: [Date, Date]) {
	const startDate = dayjs(range[0]).startOf('day');
	const endDate = dayjs(range[1]).endOf('day');
	// @ts-ignore
	return data.filter(t => {
		const curr = dayjs(t.created_at);
		return curr.isBefore(endDate) && curr.isAfter(startDate) && t.status === TRANSACTION_STATUS.APPROVED;
	});
}