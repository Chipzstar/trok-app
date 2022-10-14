import React from 'react';
import Page from '../layout/Page';
import StatementsTable from '../containers/StatementsTable';
import { GBP, SAMPLE_STATEMENTS } from '../utils/constants';
import { Button } from '@mantine/core';
import { IconDownload } from '@tabler/icons';
import dayjs from 'dayjs';

const rows = SAMPLE_STATEMENTS.map((element, index) => {
	return (
		<tr key={index}>
			<td colSpan={1}>
				<span>{element.period_label}</span>
			</td>
			<td colSpan={1}>
				<span>{dayjs.unix(element.due_at).format("MMM D")}</span>
			</td>
			<td colSpan={1}>
				<span>{GBP(element.total_balance).format()}</span>
			</td>
			<td>
				<Button size="xs" variant='outline' leftIcon={<IconDownload size={14} />}>
					Download
				</Button>
			</td>
		</tr>
	);
});

const Statements = () => {
	return (
		<Page.Container
			header={
				<Page.Header>
					<span className='text-2xl font-medium'>Statements</span>
				</Page.Header>
			}
		>
			<Page.Body>
				<StatementsTable rows={rows} />
			</Page.Body>
		</Page.Container>
	);
};

export default Statements;
