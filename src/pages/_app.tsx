import dynamic from 'next/dynamic';
import type { AppProps } from 'next/app';
import { Toaster } from 'react-hot-toast';
import ContextProvider from '@contexts/index';
import Layout from '@components/layout';

import '../styles/global.css';

const ReactTooltip = dynamic(() => import('react-tooltip'), {
	ssr: false,
});

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<ContextProvider>
			<Layout>
				<Component {...pageProps} />
			</Layout>
			<ReactTooltip id='tooltip_main' />
			<Toaster position='bottom-left' reverseOrder={false} />
		</ContextProvider>
	);
}

export default MyApp;
