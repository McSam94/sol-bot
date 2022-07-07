import Interpreter from 'js-interpreter-npm';
import { SignerWalletAdapter } from '@solana/wallet-adapter-base';
import { toast } from 'react-toastify';
import { RouteProp } from '@constants/routes';
import WalletStore from '@stores/wallet';
import JupStore from '@stores/jupiter';
import BotStore from '@stores/bot';
import { fromDecimal } from '@utils/number';

export function interpreterConfig(jsInterpreter: typeof Interpreter, scope: any) {
	jsInterpreter.setProperty(scope, 'console', jsInterpreter.nativeToPseudo(console));
	jsInterpreter.setProperty(
		scope,
		'alert',
		jsInterpreter.createNativeFunction((message: string) => alert(message))
	);
	jsInterpreter.setProperty(scope, 'info', jsInterpreter.createNativeFunction(toast.info));
	jsInterpreter.setProperty(scope, 'warn', jsInterpreter.createNativeFunction(toast.warn));
	jsInterpreter.setProperty(scope, 'error', jsInterpreter.createNativeFunction(toast.error));

	// Update Jup Params
	jsInterpreter.setProperty(
		scope,
		'updateJupParam',
		jsInterpreter.createNativeFunction((key: string, value: string) =>
			JupStore.setState(prevState => ({
				...prevState,
				blocklyState: { ...prevState.blocklyState, [key]: value },
			}))
		)
	);

	// Compute Routes
	jsInterpreter.setProperty(
		scope,
		'computeRoutes',
		jsInterpreter.createAsyncFunction(function (callback: Function) {
			JupStore.getState()
				.getComputedRoutes()
				.then(routesInfos => {
					callback(jsInterpreter.nativeToPseudo(routesInfos?.splice(0, 10)));
				});
		})
	);

	// Get Best Route Props
	jsInterpreter.setProperty(
		scope,
		'getBestRouteProp',
		jsInterpreter.createNativeFunction(function (routeProp: RouteProp) {
			const { tokens, blocklyState, bestRoute } = JupStore.getState();

			if (!bestRoute) return;

			const { inAmount, outAmount } = bestRoute;

			const bestRouteReceiveToken = tokens?.find(token => token.address === blocklyState.outputMint);
			if (!bestRouteReceiveToken) return;

			const bestRouteProp = {
				...bestRoute,
				inAmountLamport: inAmount,
				outAmountLamport: outAmount,
				inAmount: fromDecimal(inAmount, bestRouteReceiveToken.decimals),
				outAmount: fromDecimal(outAmount, bestRouteReceiveToken.decimals),
			};

			const propValue = bestRouteProp[routeProp];
			return jsInterpreter.nativeToPseudo(propValue);
		})
	);

	// Execute Swap
	jsInterpreter.setProperty(
		scope,
		'executeSwap',
		jsInterpreter.createAsyncFunction(function (wallet: SignerWalletAdapter, callback: Function) {
			JupStore.getState()
				.exchange(wallet)
				.then(() => callback());
		})
	);

	// Check if stop button is clicked
	jsInterpreter.setProperty(
		scope,
		'stopBot',
		jsInterpreter.createNativeFunction(function () {
			const shouldStop = BotStore.getState().botStatus !== 'running';
			return shouldStop;
		})
	);

	// Update bot status to 'idle'
	jsInterpreter.setProperty(
		scope,
		'stopBot',
		jsInterpreter.createNativeFunction(function () {
			BotStore.setState({ botStatus: 'idle' });
		})
	);

	// Set Wallet
	jsInterpreter.setProperty(
		scope,
		'getWallet',
		jsInterpreter.createNativeFunction(function () {
			const { wallet } = WalletStore.getState();
			return wallet;
		})
	);

	// Get Balance
	jsInterpreter.setProperty(
		scope,
		'getBalance',
		jsInterpreter.createNativeFunction(function (tokenMint: string) {
			const balance = WalletStore.getState().getBalance(tokenMint);
			return balance;
		})
	);
}
