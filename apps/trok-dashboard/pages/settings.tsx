import React from 'react';
import Page from '../layout/Page';
import { Tabs } from '@mantine/core';
import Personal from '../containers/settings/Personal';
import Company from '../containers/settings/Company';

const settings = () => {
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
					defaultValue='all'
					classNames={{
						root: 'flex flex-col grow',
						tabsList: '',
						tab: 'mr-8'
					}}
				>
					<Tabs.List>
						<Tabs.Tab value='personal'>Personal</Tabs.Tab>
						<Tabs.Tab value='company'>Company</Tabs.Tab>
					</Tabs.List>
					<Tabs.Panel value='personal' pt='xs' className='h-full'>
						<Personal/>
					</Tabs.Panel>
					<Tabs.Panel value='company' pt='xs' className='h-full'>
						<Company/>
					</Tabs.Panel>
				</Tabs>
			</Page.Body>
		</Page.Container>
	);
};

export default settings;
