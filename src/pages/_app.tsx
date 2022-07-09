import dynamic from 'next/dynamic';
import { ToastContainer } from 'react-toastify';
import type { AppProps } from 'next/app';
import ContextProvider from '@contexts/index';
import Layout from '@components/layout';

import 'react-toastify/dist/ReactToastify.css';
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
			<ToastContainer
				position='bottom-left'
				autoClose={5000}
				rtl={false}
				hideProgressBar={false}
				newestOnTop={false}
				pauseOnFocusLoss={false}
				pauseOnHover={false}
				closeOnClick
				draggable
			/>
			<ReactTooltip />
		</ContextProvider>
	);
}

export default MyApp;
