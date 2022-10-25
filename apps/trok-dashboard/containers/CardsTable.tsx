import React, { useState } from 'react';
import { useRouter } from 'next/router';
import DataGrid from '../components/DataGrid';
import Empty from '../components/Empty';
import { GBP, PATHS, SAMPLE_CARDS, STORAGE_KEYS } from '../utils/constants';
import classNames from 'classnames';
import { sanitize } from '../utils/functions';
import { ActionIcon, Group } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons';
import { useLocalStorage } from '@mantine/hooks';
import { CARD_STATUS } from '@trok-app/shared-utils';

const CardsTable = ({ data }) => {
	const router = useRouter();
	const [activePage, setPage] = useState(1);

	const rows = data.map((element, index) => {
		const statusClass = classNames({
			'py-1': true,
			'w-28': true,
			rounded: true,
			'text-center': true,
			uppercase: true,
			'text-xs': true,
			'tracking-wide': true,
			'font-semibold': true,
			'text-success': element.status === CARD_STATUS.ACTIVE,
			'text-danger': element.status === CARD_STATUS.INACTIVE,
			'bg-success/25': element.status === CARD_STATUS.ACTIVE,
			'bg-danger/25': element.status === CARD_STATUS.INACTIVE
		});
		return (
			<tr
				key={index}
				style={{
					border: 'none'
				}}
			>
				<td colSpan={1}>
					<span>{element.last4}</span>
				</td>
				<td colSpan={1}>
					<div className={statusClass}>
						<span>{sanitize(element.status)}</span>
					</div>
				</td>
				<td colSpan={1}>
					<div className='flex flex-shrink flex-col'>
						<span>{element.cardholder_name}</span>
					</div>
				</td>
				<td colSpan={1}>
					<span>{GBP(element.current_balance).format()}</span>
				</td>
				<td colSpan={1}>
					<span>{GBP(element.spending_limits[0].amount).format()}</span>
				</td>
				<td role='button' onClick={() => router.push(`${PATHS.CARDS}/${element.id}`)}>
					<Group grow position='left'>
						<ActionIcon size='sm'>
							<IconChevronRight />
						</ActionIcon>
					</Group>
				</td>
			</tr>
		);
	});

	return (
		<DataGrid
			rows={rows}
			activePage={activePage}
			setPage={setPage}
			spacingY='md'
			headings={[
				{ label: 'Card Number', key: null },
				{ label: 'Status', key: null },
				{ label: 'Assigned ', key: null },
				{ label: 'Balance', key: null },
				{ label: 'Weekly Spend Limit', key: null },
				{ label: '', key: null }
			]}
			emptyContent={
				<Empty
					message={
						<span className='text-center text-2xl'>
							You have no cards
							<br />
							Click the "Add new card" button to add a new card
						</span>
					}
				/>
			}
		/>
	);
};

export default CardsTable;
