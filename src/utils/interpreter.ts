import JupStore from '@blockly/store/jupiter';
import { RouteProp } from '@constants/routes';
import Interpreter from 'js-interpreter-npm';
import { toast } from 'react-toastify';
import { fromDecimal } from './number';

export function interpreterConfig(jsInterpreter: typeof Interpreter, scope: any) {
	jsInterpreter.setProperty(scope, 'console', jsInterpreter.nativeToPseudo(console));
	jsInterpreter.setProperty(
		scope,
		'alert',
		jsInterpreter.createNativeFunction((message: string) => alert(message))
	);
	jsInterpreter.setProperty(scope, 'toast', jsInterpreter.createNativeFunction(toast.info));

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
			const { bestRoute, tokens, blocklyState } = JupStore.getState();

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
		jsInterpreter.createAsyncFunction(function (callback: Function) {
			JupStore.getState()
				.exchangeBestRoute()
				.then(() => callback());
		})
	);

	// Check if stop button is clicked
	jsInterpreter.setProperty(
		scope,
		'stopBot',
		jsInterpreter.createNativeFunction(function () {
			const shouldStop = JupStore.getState().botStatus !== 'running';
			return shouldStop;
		})
	);

	// Update bot status to 'idle'
	jsInterpreter.setProperty(
		scope,
		'idleBot',
		jsInterpreter.createNativeFunction(function () {
			JupStore.setState({ botStatus: 'idle' });
		})
	);
}
