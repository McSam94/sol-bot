import { ToastContainer } from 'react-toastify';
import ReactTooltip from 'react-tooltip';
import type { AppProps } from 'next/app';
import ContextProvider from '@contexts/index';
import Layout from '@components/layout';

import 'react-toastify/dist/ReactToastify.css';
import '../styles/global.css';

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<ContextProvider>
			<Layout>
				<Component {...pageProps} />
			</Layout>
			<ToastContainer
				position='bottom-left'
				autoClose={5000}
				hideProgressBar={false}
				newestOnTop={false}
				rtl={false}
				pauseOnFocusLoss={false}
				closeOnClick
				draggable
				pauseOnHover
			/>
			<ReactTooltip />
		</ContextProvider>
	);
}

export default MyApp;
