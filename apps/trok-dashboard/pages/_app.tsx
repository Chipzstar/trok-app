import '../styles/globals.css';
import { createEmotionCache, MantineProvider } from '@mantine/core';
import { AppProps } from 'next/app';
import Head from 'next/head';
import Layout from '../layout/Layout';
import Favicon from '../components/Favicon';
import { useLocalStorage } from '@mantine/hooks';

const appendCache = createEmotionCache({ key: 'mantine', prepend: false });

function CustomApp({ Component, pageProps }: AppProps) {
	const [auth, setAuth] = useLocalStorage({ key: 'auth', defaultValue: true });
	return (
		<>
			<MantineProvider
				emotionCache={appendCache}
				withGlobalStyles
				withNormalizeCSS
				theme={{
					/** Put your mantine theme override here */
					colorScheme: 'light'
				}}
			>
				<Layout auth={auth} setAuth={setAuth}>
					<Head>
						<Favicon />
						<title>Trok</title>
						<meta name='description' content='Trok - A zero-fee fuel card accepted everywhere' />
						<meta
							name='keywords'
							content='fuels, fuel card, fuel card accepted, card accepted, fuel cards, fuelcard, fuel cards uk, fuel card for business, corporate fuel cards, best fuel card, fuel card services, fuel credit card,  ukfuels, zero-fees, zero-fee fuel, Zero-fee fuel card, owner-operator, fuel prices, uk fuel prices, petrol fuel prices, diesel prices, atob fuel card, best fuel credit card 2022, thefuelcard company, fleet fuel cards, best fuel cards trucking, fuel cards in europe, fuel genie, keyfuels, uk fuels alternative, cheapest fuel cards, fuel card for truckers, why being charged difference prices using fuelman card at a maverick, allstar fuel card, how to get a fuel card without a business, fleet fuel cards'
						/>
						<meta httpEquiv='content-language' content='en-GB' />
						<meta name='viewport' content='minimum-scale=1, initial-scale=1, width=device-width' />
					</Head>
					<Component auth={auth} setAuth={setAuth} {...pageProps} />
				</Layout>
			</MantineProvider>
		</>
	);
}

export default CustomApp;
