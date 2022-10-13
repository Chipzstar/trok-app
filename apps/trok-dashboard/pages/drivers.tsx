import { ActionIcon, Button, Group } from '@mantine/core';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { IconPencil } from '@tabler/icons';
import { GBP, SAMPLE_DRIVERS } from '../utils/constants';
import PageContainer from '../layout/PageContainer';
import DriversTable from '../containers/DriversTable';

const rows = SAMPLE_DRIVERS.map((element, index) => {
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
				<span>{GBP(element.spending_limit).format()}</span>
			</td>
			<td colSpan={1}>
				<span>{element.phone}</span>
			</td>
			<td colSpan={1}>
				<span>{element.email}</span>
			</td>
			<td>
				<Group spacing='md' position='left'>
					<ActionIcon size='sm' onClick={() => null}>
						<IconPencil />
					</ActionIcon>
				</Group>
			</td>
		</tr>
	);
});

const Drivers = () => {
	const router = useRouter();
	const [activePage, setPage] = useState(1);

	return (
		<PageContainer
			header={
				<PageContainer.Header>
					<span className='text-2xl font-medium'>Drivers</span>
					<Button className='' onClick={() => null}>
						<span className='text-base font-normal'>Add new driver</span>
					</Button>
				</PageContainer.Header>
			}
		>
			<PageContainer.Body>
				<DriversTable rows={rows}/>
			</PageContainer.Body>
		</PageContainer>
	);
};

export default Drivers;
