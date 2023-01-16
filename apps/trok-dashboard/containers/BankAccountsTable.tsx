import React, { useState } from 'react';
import DataGrid from '../components/DataGrid';
import Empty from '../components/Empty';
import { ActionIcon, Badge, LoadingOverlay, Menu } from '@mantine/core';
import { IconCheck, IconDots, IconPencil, IconX } from '@tabler/icons';
import { notifyError, notifySuccess } from '@trok-app/shared-utils';
import { trpc } from '../utils/clients';
import { useSession } from 'next-auth/react';

const BankAccountsTable = ({ loading, data }) => {
	const { data: session } = useSession();
	const [activePage, setPage] = useState(1);
	const utils = trpc.useContext();
	const setDefaultMutation = trpc.bank.setDefaultAccount.useMutation({
		onSuccess: function (input) {
			utils.bank.getBankAccounts.invalidate({ userId: session.id }).then(r => console.log(input, 'Bank Accounts refetched'));
		}
	});

	const rows = data.map((element, index) => {
		return (
			<tr key={index}>
				<td colSpan={1}>
					<span>{element.account_holder_name}</span>
				</td>
				<td colSpan={1}>
					<span className='capitalize'>Business Account</span>
				</td>
				<td colSpan={1}>
					<span>{element.account_number.replace(/^.{4}/g, '****')}</span>
				</td>
				<td colSpan={1}>
					<span>{element.sort_code}</span>
				</td>
				<td>
					{element.is_default ? (
						<Badge radius='xs' variant='light' color='gray'>
							DEFAULT
						</Badge>
					) : (
						<Menu transition='pop' withArrow position='bottom-end'>
							<Menu.Target>
								<ActionIcon>
									<IconDots size={16} stroke={1.5} />
								</ActionIcon>
							</Menu.Target>
							<Menu.Dropdown>
								<Menu.Item
									onClick={() =>
										setDefaultMutation
											.mutateAsync({
												id: element.id,
												userId: session.id,
												stripeId: session.stripe.account_id
											})
											.then(() =>
												notifySuccess(
													'change-default-success',
													'Default bank account changed!',
													<IconCheck size={20} />
												)
											)
											.catch(err =>
												notifyError('change-default-failure', err.message, <IconX size={20} />)
											)
									}
									color='gray'
									icon={<IconPencil size={16} stroke={1.5} />}
								>
									Set as default
								</Menu.Item>
							</Menu.Dropdown>
						</Menu>
					)}
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
				{ label: 'Business Account Name', key: null },
				{ label: 'Account Type', key: null },
				{ label: 'Account Number', key: null },
				{ label: 'Sort Code', key: null },
				{ label: '', key: null }
			]}
			emptyContent={
				<Empty
					message={
						<span className='text-center text-2xl'>
							You have no bank account
							<br />
							{"Click the 'Add bank account' button to link one"}
						</span>
					}
				/>
			}
		/>
	);
};

export default BankAccountsTable;
