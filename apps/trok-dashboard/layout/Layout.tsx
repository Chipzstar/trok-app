import React, { useState } from 'react';
import { AppShell, Navbar } from '@mantine/core';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
	const [auth, setAuth] = useState(true)
	return (
		<div className='relative flex min-h-screen'>
			<AppShell
				padding={0}
				navbar={<Sidebar />}
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
