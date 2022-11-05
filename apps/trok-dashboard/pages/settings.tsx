import React from 'react';
import Page from '../layout/Page';
import { Tabs } from '@mantine/core';
import Personal from '../containers/settings/Personal';
import Company from '../containers/settings/Company';
import { getToken } from 'next-auth/jwt';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]';
import ChangePassword from '../containers/settings/ChangePassword';

const settings = ({ user, session_id, stripe }) => {
	return (
		<Page.Container
			header={
				<Page.Header>
					<span className='heading-1 capitalize'>Settings</span>
				</Page.Header>
			}
		>
			<Page.Body>
				<Tabs
					defaultValue='personal'
					classNames={{
						root: 'flex flex-col grow',
						tabsList: '',
						tab: 'mr-8'
					}}
				>
					<Tabs.List>
						<Tabs.Tab value='personal'>Personal</Tabs.Tab>
						<Tabs.Tab value='company'>Company</Tabs.Tab>
						<Tabs.Tab value='password'>Change Password</Tabs.Tab>
					</Tabs.List>
					<Tabs.Panel value='personal' pt='xs' className='h-full'>
						<Personal stripe={stripe} account={user} />
					</Tabs.Panel>
					<Tabs.Panel value='company' pt='xs' className='h-full'>
						<Company user_id={session_id} stripe={stripe} business={user?.business} />
					</Tabs.Panel>
					<Tabs.Panel value='password' pt='xs' className='h-full'>
						<ChangePassword user_id={session_id} />
					</Tabs.Panel>
				</Tabs>
			</Page.Body>
		</Page.Container>
	);
};

export async function getServerSideProps({ req, res }) {
	// @ts-ignore
	const session = await unstable_getServerSession(req, res, authOptions);
	const token = await getToken({ req })
	return {
		props: {
			session_id: session.id,
			user: token.user,
			stripe: session?.stripe
		}
	}
}

export default settings;
