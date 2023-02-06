import React, { useState } from 'react';
import Empty from '../components/Empty';
import DataGrid from '../components/DataGrid';
import { ActionIcon, Group, LoadingOverlay } from '@mantine/core';
import { GBP } from '@trok-app/shared-utils';
import { IconPencil, IconTrash } from '@tabler/icons';
import Prisma from '@prisma/client';

interface Props {
	data: Prisma.Driver[],
	loading: boolean,
	onEdit: (val: Prisma.Driver) => void;
	onDelete: (val: Prisma.Driver) => void;
}

const DriversTable = ({ data, loading, onEdit, onDelete }: Props) => {
	const [activePage, setPage] = useState(1);
	const rows = data.map((element, index) => {
		return (
			<tr key={index}>
				<td colSpan={1}>
					<span>{element.firstname}</span>
				</td>
				<td colSpan={1}>
					<span>{element.lastname}</span>
				</td>
				<td colSpan={1}>
					<span>{GBP(element.current_spend).format()}</span>
				</td>
				<td colSpan={1}>
								<span>
									{element?.spending_limit?.amount
										? GBP(element.spending_limit.amount).format()
										: '-'}
								</span>
				</td>
				<td colSpan={1}>
					<span>{element.phone}</span>
				</td>
				<td colSpan={1}>
					<span>{element.email}</span>
				</td>
				<td>
					<Group spacing='md' position='left'>
						<ActionIcon size='sm' onClick={() => onEdit(element)} data-cy={`driver-edit-button-${index}`}>
							<IconPencil />
						</ActionIcon>
						<ActionIcon size='sm' onClick={() => onDelete(element)} color='red' data-cy={`driver-delete-button-${index}`}>
							<IconTrash />
						</ActionIcon>
					</Group>
				</td>
			</tr>
		);
	});

	return loading ? (
		<div className='relative h-full'>
			<LoadingOverlay visible={loading} transitionDuration={500} overlayBlur={2} />
		</div>
	) : (
		<DataGrid
			rows={rows}
			activePage={activePage}
			setPage={setPage}
			spacingY='md'
			headings={[
				{ label: 'First Name', key: null },
				{ label: 'Last Name', key: null },
				{ label: 'Spend', key: null },
				{ label: 'Limit', key: null },
				{ label: 'Phone Number', key: null },
				{ label: 'Email', key: null },
				{ label: '', key: null }
			]}
			emptyContent={
				<Empty
					message={
						<span className='text-center text-2xl'>
							You have no drivers
							<br />
							{'Click the \'Add Driver\' button to add one'}
						</span>
					}
				/>
			}
		/>
	);
};

export default DriversTable;
