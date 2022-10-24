import '../styles/globals.css';
import { createEmotionCache, MantineProvider } from '@mantine/core';
import { AppProps } from 'next/app';
import Head from 'next/head';
import Layout from '../layout/Layout';
import Favicon from '../components/Favicon';
import { useLocalStorage } from '@mantine/hooks';
import { NotificationsProvider } from '@mantine/notifications';
import { STORAGE_KEYS } from '../utils/constants';
import { SessionProvider } from 'next-auth/react';
import { Session } from 'next-auth';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { trpc } from '../utils/clients';

const appendCache = createEmotionCache({ key: 'mantine', prepend: false });

function CustomApp({ Component, pageProps: { session, ...pageProps } }: AppProps<{ session: Session }>) {
	const [testMode, setTestMode] = useLocalStorage({ key: STORAGE_KEYS.TEST_MODE, defaultValue: false });
	const [queryClient] = useState(() => new QueryClient());
	const [trpcClient] = useState(() =>
		trpc.createClient({
			links: [
				httpBatchLink({
					url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/server/trpc`
					// optional
				})
			]
		})
	);
	return (
		<trpc.Provider client={trpcClient} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>
				<SessionProvider session={session}>
					<MantineProvider
						emotionCache={appendCache}
						withGlobalStyles
						withNormalizeCSS
						theme={{
							colors: {
								default: [
									'#FFFFFF',
									'#FCFCFC',
									'#E7E7E7',
									'#D3D3D3',
									'#BEBEBE',
									'#AAAAAA',
									'#8E8E8E',
									'#727272',
									'#565656',
									'#3A3A3A'
								],
								brand: [
									'#CDD0E8',
									'#ADB1E1',
									'#8A91E0',
									'#636EE6',
									'#3646F5',
									'#2F3EDE',
									'#333FBF',
									'#3A439F',
									'#3E4486',
									'#3E4272'
								]
							},
							primaryShade: 5,
							primaryColor: 'brand',
							fontFamily: 'Aeonik, sans-serif',
							colorScheme: 'light'
						}}
					>
						<NotificationsProvider position='top-right'>
							<Layout>
								<Head>
									<Favicon />
									<title>Trok</title>
									<meta
										name='description'
										content='Trok - A zero-fee fuel card accepted everywhere'
									/>
									<meta
										name='keywords'
										content='fuels, fuel card, fuel card accepted, card accepted, fuel cards, fuelcard, fuel cards uk, fuel card for business, corporate fuel cards, best fuel card, fuel card services, fuel credit card,  ukfuels, zero-fees, zero-fee fuel, Zero-fee fuel card, owner-operator, fuel prices, uk fuel prices, petrol fuel prices, diesel prices, atob fuel card, best fuel credit card 2022, thefuelcard company, fleet fuel cards, best fuel cards trucking, fuel cards in europe, fuel genie, keyfuels, uk fuels alternative, cheapest fuel cards, fuel card for truckers, why being charged difference prices using fuelman card at a maverick, allstar fuel card, how to get a fuel card without a business, fleet fuel cards'
									/>
									<meta httpEquiv='content-language' content='en-GB' />
									<meta
										name='viewport'
										content='minimum-scale=1, initial-scale=1, width=device-width'
									/>
								</Head>
								<Component testMode={testMode} setAuth={setTestMode} {...pageProps} />
							</Layout>
						</NotificationsProvider>
					</MantineProvider>
				</SessionProvider>
			</QueryClientProvider>
		</trpc.Provider>
	);
}

export default CustomApp;
