import { Group, Text, Avatar, Switch, ActionIcon, Button } from '@mantine/core';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import DataGrid from '../components/DataGrid';
import Empty from '../components/Empty';
import dayjs from 'dayjs';
import { IconCreditCard, IconPencil, IconTrash } from '@tabler/icons';
import { SAMPLE_DRIVERS } from '../utils/constants';


const drivers = () => {
	const router = useRouter();
	const [activePage, setPage] = useState(1);

	const rows = SAMPLE_DRIVERS.map((element, index) => {
		return (
			<tr key={index}>
				<td colSpan={1}>
					<Group spacing='sm'>
						<IconCreditCard
							size={30}
							stroke={1}
						/>
						<span>{element.last4}</span>
					</Group>
				</td>
				<td colSpan={1}>
					<Group spacing='sm'>
						<Avatar
							size={40}
							radius={40}
							classNames={{
								placeholder: 'bg-transparent'
							}}
						/>
						<span>
							{element.firstname} {element.lastname}
						</span>
					</Group>
				</td>
				<td colSpan={1}>
					<span>{element.vin}</span>
				</td>
				<td colSpan={1}>
					<span>{element.phone}</span>
				</td>
				<td>
					<Group spacing='md' position='left'>
						<ActionIcon
							size='sm'
							onClick={() => null}
						>
							<IconPencil />
						</ActionIcon>
						<ActionIcon size='sm' color='red' onClick={() => null}>
							<IconTrash />
						</ActionIcon>
					</Group>
				</td>
			</tr>
		);
	});

	return (
		<div className='container p-5'>
			<div className='mt-2 mb-6 flex items-center justify-between px-2'>
				<span className="text-3xl font-semibold">Cards</span>
				<Button className='' onClick={() => null}>
					<span className='text-base'>Add Card</span>
				</Button>
			</div>
			<DataGrid
				rows={rows}
				activePage={activePage}
				setPage={setPage}
				spacingY='md'
				headings={[
					{ label: 'Card Last 4', key: null },
					{
						label: 'Driver Name',
						key: null
					},
					{ label: 'VIN', key: null },
					{ label: 'Phone', key: null },
					{ label: 'Actions', key: null }
				]}
				emptyContent={
					<Empty
						message={
							<span className='text-center text-2xl'>
								You have no drivers
								<br />
								Click the 'Add Driver' button to add one
							</span>
						}
					/>
				}
			/>
		</div>
	);
};

export default drivers;
