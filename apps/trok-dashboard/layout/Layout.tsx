import React from 'react';
import { AppShell } from '@mantine/core';
import Sidebar from './Sidebar';

const Layout = ({ children, auth, setAuth }) => {
	return (
		<div className='relative flex min-h-screen font-aeonik'>
			<AppShell
				padding={0}
				navbar={auth && <Sidebar setAuth={setAuth}/>}
				styles={(theme) => ({
					main: { backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0] }
				})}
			>
				{children}
			</AppShell>
		</div>
	);
};

export default Layout;
