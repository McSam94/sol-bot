import Interpreter from 'js-interpreter-npm';
import { RouteInfo } from '@jup-ag/core';
import toast from 'react-hot-toast';
import { SignerWalletAdapter } from '@solana/wallet-adapter-base';
import JSBI from 'jsbi';
import { fromDecimal } from '@utils/number';
import JupStore from '@stores/jupiter';
import { RouteProp } from '@constants/routes';

const jupInterpreter = (jsInterpreter: typeof Interpreter, scope: any) => {
	// Update Jup Params
	jsInterpreter.setProperty(
		scope,
		'updateJupParam',
		jsInterpreter.createNativeFunction((key: string, value: string) => {
			const { tokens } = JupStore.getState();
			if (['inputToken', 'outputToken'].includes(key)) {
				const token = tokens?.find(token => token.address === value);

				JupStore.setState(prevState => ({
					...prevState,
					blocklyState: { ...prevState.blocklyState, [key]: token },
				}));
			} else {
				JupStore.setState(prevState => ({
					...prevState,
					blocklyState: { ...prevState.blocklyState, [key]: value },
				}));
			}
		})
	);

	// Update routes cache time
	jsInterpreter.setProperty(
		scope,
		'updateRoutesCache',
		jsInterpreter.createNativeFunction((value: number) => JupStore.setState({ cacheSecond: value }))
	);

	// Compute Routes
	jsInterpreter.setProperty(
		scope,
		'computeRoutes',
		jsInterpreter.createAsyncFunction(function (callback: Function) {
			const {
				getComputedRoutes,
				blocklyState: { inputToken, outputToken, amount },
			} = JupStore.getState();

			toast.promise(
				new Promise<RouteInfo>((resolve, reject) =>
					getComputedRoutes()
						.then(routesInfos => {
							callback();
							const bestRoutes = routesInfos?.[0];
							bestRoutes ? resolve(bestRoutes) : reject();
						})
						.catch(() => {
							callback([]);
							reject();
						})
				),
				{
					loading: `Finding the best routes for \n ${amount} ${inputToken?.symbol} → ${outputToken?.symbol}`,
					success: (data: RouteInfo) =>
						`Best routes has found \t\t  \n ${data.marketInfos
							.map(marketInfo => marketInfo.amm.label)
							.join(' → ')} \n ${`${fromDecimal(
							JSBI.toNumber(data.outAmount),
							outputToken?.decimals ?? 0
						)} ${outputToken?.symbol ?? ''}`}`,
					error: 'Something went wrong when finding routes',
				}
			);
		})
	);

	// Get Best Route Props
	jsInterpreter.setProperty(
		scope,
		'getBestRouteProp',
		jsInterpreter.createNativeFunction(function (routeProp: RouteProp) {
			const { tokens, blocklyState, computedRoutes } = JupStore.getState();

			if (!computedRoutes) return;

			const bestRoute = computedRoutes[0];
			const { inAmount, outAmount, otherAmountThreshold } = bestRoute;

			const bestRouteReceiveToken = tokens?.find(token => token.address === blocklyState.outputToken?.address);
			if (!bestRouteReceiveToken) return;

			const inAmountNum = JSBI.toNumber(inAmount);
			const outAmountNum = JSBI.toNumber(outAmount);
			const otherAmountThresholdNum = JSBI.toNumber(otherAmountThreshold);

			const bestRouteProp = {
				...bestRoute,
				inAmountLamport: inAmountNum,
				outAmountLamport: outAmountNum,
				otherAmountThresholdLamport: otherAmountThresholdNum,
				inAmount: fromDecimal(inAmountNum, bestRouteReceiveToken.decimals),
				outAmount: fromDecimal(outAmountNum, bestRouteReceiveToken.decimals),
				otherAmountThreshold: fromDecimal(otherAmountThresholdNum, bestRouteReceiveToken.decimals),
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
			const { exchange, blocklyState, computedRoutes } = JupStore.getState();

			const bestRoutes = computedRoutes?.[0];
			const { amount, inputToken, outputToken } = blocklyState;
			const outAmount = fromDecimal(
				JSBI.toNumber(bestRoutes?.outAmount ?? JSBI.BigInt(0)),
				outputToken?.decimals ?? 0
			);
			toast.promise(
				exchange(wallet).finally(() => callback()),
				{
					loading: `Swapping ${amount} ${inputToken?.symbol} with ${outAmount} ${outputToken?.symbol}`,
					success: 'Swapped successfully',
					error: 'Swapped failed',
				}
			);
		})
	);

	// Swap Result
	jsInterpreter.setProperty(
		scope,
		'getSwapResult',
		jsInterpreter.createNativeFunction(function (type: 'success' | 'failed') {
			const { swapResult } = JupStore.getState();

			return type === 'success' ? swapResult : !swapResult;
		})
	);
};

export default jupInterpreter;
