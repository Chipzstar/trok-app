import { CARD_REDIS_SORTED_SET_ID } from '../utils/constants';
import redisClient from '../redis';
import dayjs from 'dayjs';
import prisma from '../db';
import { CARD_SHIPPING_STATUS } from '@trok-app/shared-utils';

export async function checkCardDeliveredStatus(override = false) {
	try {
		// set buffer of max +1 hour and min -1 hour from current timestamp
		const MAX = dayjs().add(1, 'h').unix();
		const MIN = dayjs().subtract(1, 'h').unix();
		console.table({MIN, MAX})
		const card_ids = override
			? await redisClient.zrange(CARD_REDIS_SORTED_SET_ID, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, 'BYSCORE', (err, res) =>
					console.log('RESULT:', res))
			: await redisClient.zrange(CARD_REDIS_SORTED_SET_ID, MIN, MAX, 'BYSCORE', (err, res) =>
					console.log('RESULT:', res));
		// mark all returned card shipping_statuses from "shipped" to "delivered"
		card_ids.map(async (id, index) => {
			const num_removed = await redisClient.zrem(CARD_REDIS_SORTED_SET_ID, id)
			console.table({num_removed})
			return await prisma.card.update({
				where: {
					card_id: id
				},
				data: {
					shipping_status: CARD_SHIPPING_STATUS.DELIVERED
				}
			});
		});
		return true;
	} catch (err) {
		console.error(err);
		throw err;
	}
}