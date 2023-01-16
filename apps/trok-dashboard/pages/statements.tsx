import React from 'react';
import Page from '../layout/Page';
import StatementsTable from '../containers/StatementsTable';
import { SAMPLE_STATEMENTS } from '../utils/constants';
import { Anchor, Button } from '@mantine/core';
import { IconDownload } from '@tabler/icons';
import dayjs from 'dayjs';
import { trpc } from '../utils/clients';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]';
import { GBP } from '@trok-app/shared-utils';

const Statements = ({ testMode, session_id }) => {
	const query = trpc.statement.getStatements.useQuery({ userId: session_id });

	const rows = testMode
		? SAMPLE_STATEMENTS.map((element, index) => {
				return (
					<tr key={index}>
						<td colSpan={1}>
							<span>{dayjs(element.created_at).format('MMMM YY')}</span>
						</td>
						<td colSpan={1}>
							<span>{dayjs.unix(element.due_at).format('MMM D')}</span>
						</td>
						<td colSpan={1}>
							<span>{GBP(element.total_balance).format()}</span>
						</td>
						<td>
							<Button size='xs' variant='outline' leftIcon={<IconDownload size={14} />}>
								Download
							</Button>
						</td>
					</tr>
				);
		  })
		: query?.data
		? query?.data?.map((element, index) => {
				return (
					<tr key={index}>
						<td colSpan={1}>
							<span>{dayjs(element.created_at).format('MMMM YY')}</span>
						</td>
						<td colSpan={1}>
							<span>{dayjs(element.period_end).format('MMM D')}</span>
						</td>
						<td colSpan={1}>
							<span>{GBP(element.total_balance).format()}</span>
						</td>
						<td>
							<Anchor
								href={element.download_url}
								target='_blank'
								download={element.statement_id + '.pdf'}
							>
								<Button size='xs' variant='outline' leftIcon={<IconDownload size={14} />}>
									Download
								</Button>
							</Anchor>
						</td>
					</tr>
				);
		  })
		: [];

	return (
		<Page.Container
			header={
				<Page.Header>
					<span className='text-2xl font-medium'>Statements</span>
				</Page.Header>
			}
		>
			<Page.Body>
				<StatementsTable loading={!testMode && query.isLoading} rows={rows} />
			</Page.Body>
		</Page.Container>
	);
};

export const getServerSideProps = async ({ req, res }) => {
	// @ts-ignore
	const session = await unstable_getServerSession(req, res, authOptions);
	return {
		props: {
			session_id: session.id
		}
	};
};

export default Statements;
