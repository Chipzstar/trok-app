import React, { useEffect, useMemo, useState } from 'react';
import { AppShell, Header } from '@mantine/core';
import Sidebar from './Sidebar';
import { useRouter } from 'next/router';
import VerifyBanner from '../components/VerifyBanner';
import { BANNER_HEIGHT, DEFAULT_HEADER_HEIGHT, PATHS } from '../utils/constants';
import { useSession } from 'next-auth/react';
import { trpc } from '../utils/clients';
import { useIdle } from '@mantine/hooks';
import { ONE_HOUR } from '@trok-app/shared-utils';
import SessionTimeout from '../components/SessionTimeout';

const Layout = ({ children }) => {
	const router = useRouter()
	const [timeout, setTimeout] = useState(false)
	const idle = useIdle(ONE_HOUR);
	const { data: session } = useSession()
	const { data: approved } = trpc.checkAccountApproved.useQuery(
		{
			id: session?.id
		},
		{
			// The query will not execute until the userId exists
			enabled: !!session?.id
		}
	);
	const isLoggedIn = useMemo(() => ![PATHS.LOGIN, PATHS.SIGNUP, PATHS.ONBOARDING, PATHS.VERIFY_EMAIL].includes(router.pathname), [router.pathname]);
	
	return (
		<div className='relative flex min-h-screen font-aeonik'>
			<SessionTimeout opened={idle && session} onClose={() => setTimeout(false)}/>
			<AppShell
				padding={0}
				header={isLoggedIn && approved === false && <Header height={DEFAULT_HEADER_HEIGHT} zIndex={50}><VerifyBanner/></Header>}
				navbar={isLoggedIn && <Sidebar />}
				styles={theme => ({
					main: {
						backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0]
					}
				})}
			>
				{children}
			</AppShell>
		</div>
	);
};

export default Layout;
