import { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/styles.css';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc } from '../utils/clients';
import { httpBatchLink } from '@trpc/client';
import { createEmotionCache, MantineProvider } from '@mantine/core';
import Favicon from '../components/Favicon';

const appendCache = createEmotionCache({ key: 'mantine', prepend: false });

function CustomApp({ Component, pageProps }: AppProps) {
	const [queryClient] = useState(() => new QueryClient());
	const [trpcClient] = useState(() =>
		trpc.createClient({
			links: [
				httpBatchLink({
					url: String(process.env.NEXT_PUBLIC_API_BASE_URL) + '/server/trpc'
				})
			]
		})
	);
	return (
		<trpc.Provider client={trpcClient} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>
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
						colorScheme: 'light',
						headings: {
							// properties for all headings
							fontFamily: 'Aeonik, sans-serif'
						}
					}}
				>
					<Head>
						<Favicon />
						<title>Trok KPI Dashboard</title>
					</Head>
					<Component {...pageProps} />
				</MantineProvider>
			</QueryClientProvider>
		</trpc.Provider>
	);
}

export default CustomApp;
