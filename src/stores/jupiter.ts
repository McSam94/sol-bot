import * as React from 'react';
import { Cluster, Connection, PublicKey } from '@solana/web3.js';
import { Jupiter, RouteInfo, SwapResult, TOKEN_LIST_URL } from '@jup-ag/core';
import { SignerWalletAdapter } from '@solana/wallet-adapter-base';
import create from 'zustand/vanilla';
import { NETWORK, RPC_ENDPOINT } from '@constants/connection';
import { ROUTES_PROPS } from '@constants/routes';
import { CustomDropdownOption } from '@blockly/fields/dropdown';
import { convertStoreToHooks } from '@utils/store';
import { fromDecimal } from '@utils/number';

export interface Token {
	chainId: number;
	address: string;
	symbol: string;
	name: string;
	decimals: number;
	logoURI: string;
	tags: string[];
}

export interface BlocklyState {
	inputToken: Token | undefined;
	outputToken: Token | undefined;
	amount: number | undefined;
	slippage: number | undefined;
	selectedRouteIndex: number | undefined;
	shouldSwap: boolean | undefined;
	shouldTradeAgain: boolean | undefined;
}

interface TransactionHistory {
	dateTime: Date;
	txid: string;
	param: {
		inputToken: Token | undefined;
		outputToken: Token | undefined;
		inAmount: number;
		outAmount: number;
		slippage: number;
		routes: Array<string>;
	};
}

interface TransactionError {
	dateTime: Date;
	message: string;
	txid: string | null;
}

interface JupStoreInt {
	jupiter: Jupiter | null;
	routeMap: Map<string, string[]> | null;
	computedRoutes: Array<RouteInfo> | null;
	computedRoutesLastFetch: Date | null;
	cacheSecond: number;
	tokens: Array<Token> | null;
	blocklyState: BlocklyState;
	transactions: Array<TransactionHistory> | null;
	errors: Array<TransactionError> | null;
	swapResult: boolean | null;
	init: () => Promise<void>;
	getTokensDropdown: () => Array<CustomDropdownOption> | undefined;
	getAvailablePairedTokenDropdown: (inputMint: string) => Array<CustomDropdownOption> | undefined;
	getRoutePropDropdown: () => Array<CustomDropdownOption> | undefined;
	getComputedRoutes: () => Promise<Array<RouteInfo> | null>;
	setWallet: (wallet: SignerWalletAdapter) => void;
	exchange: (wallet: SignerWalletAdapter) => Promise<void>;
	clearTransaction: () => void;
	clearErrors: () => void;
}

const initialBlocklyState = {
	inputToken: undefined,
	outputToken: undefined,
	amount: undefined,
	slippage: undefined,
	selectedRouteIndex: undefined,
	shouldSwap: undefined,
	shouldTradeAgain: undefined,
};

const JupStore = create<JupStoreInt>((set, get) => ({
	jupiter: null,
	wallet: null,
	routeMap: null,
	computedRoutes: null,
	computedRoutesLastFetch: null,
	cacheSecond: 0,
	tokens: null,
	transactions: null,
	errors: null,
	blocklyState: initialBlocklyState,
	swapResult: null,
	init: async () => {
		const tokens = await fetch(TOKEN_LIST_URL[NETWORK as Cluster]).then(res => res.json());
		const jupiter = await Jupiter.load({
			connection: new Connection(RPC_ENDPOINT),
			cluster: NETWORK as Cluster,
		});
		const routeMap = jupiter.getRouteMap();
		set({ jupiter, tokens, routeMap });
	},
	getTokensDropdown: () =>
		get().tokens?.map(({ logoURI, name, symbol, address }) => ({
			img: logoURI,
			label: `${name} (${symbol})`,
			value: address,
		})),
	getAvailablePairedTokenDropdown: (inputMint: string) => {
		const { tokens, routeMap } = get();
		const possiblePairedToken = routeMap?.get(inputMint);

		return possiblePairedToken
			?.map(address => {
				const token = tokens?.find(token => token.address === address);

				if (!token) return undefined;

				return {
					img: token.logoURI,
					label: `${token.name} (${token.symbol})`,
					value: token.address,
				};
			})
			.filter(Boolean);
	},
	getRoutePropDropdown: () =>
		Object.entries(ROUTES_PROPS)
			.map(([key, value]) => ({ label: key, value }))
			.filter(Boolean),
	getComputedRoutes: async () => {
		const { blocklyState, tokens, jupiter, computedRoutesLastFetch, cacheSecond, computedRoutes } = get();

		const now = new Date().getTime();
		const previouslyFetchTimestamp = computedRoutesLastFetch?.getTime() ?? new Date().getTime();
		if (computedRoutesLastFetch && (now - previouslyFetchTimestamp) / 1000 < cacheSecond) {
			return computedRoutes;
		}

		const { inputToken, outputToken, amount, slippage } = blocklyState;

		const amountNum = +(amount ?? 0);
		const slippageNum = +(slippage ?? 0);
		if (!inputToken || !outputToken || !amountNum || !slippageNum) return null;

		const newComputedRoutes: Array<RouteInfo> | null =
			(
				await jupiter?.computeRoutes({
					inputMint: new PublicKey(inputToken.address),
					outputMint: new PublicKey(outputToken.address),
					inputAmount: amountNum * 10 ** inputToken.decimals,
					slippage: slippageNum,
				})
			)?.routesInfos ?? null;

		// JsInterpreter can't convert RouteInfo properly so passed through zustand
		set({ computedRoutes: newComputedRoutes ?? null, computedRoutesLastFetch: new Date() });
		return computedRoutes;
	},
	setWallet: (wallet: SignerWalletAdapter) => {
		const { jupiter } = get();

		jupiter?.setUserPublicKey(wallet.publicKey ?? PublicKey.default);
		set({ jupiter });
	},
	exchange: async (wallet: SignerWalletAdapter) => {
		const { jupiter, computedRoutes, blocklyState } = get();

		if (!jupiter) throw new Error('Jupiter not initialized');
		if (!computedRoutes) throw new Error('Best route not found');
		if (!wallet) throw new Error('Wallet not found');

		const bestRoute = computedRoutes[0];
		const { execute } = await jupiter?.exchange({
			routeInfo: bestRoute,
		});

		const swapResult: SwapResult = await execute({
			wallet,
		});

		const dateTime = new Date();
		if ('error' in swapResult) {
			const { error } = swapResult;
			if (!error) return;
			set(prevState => ({
				...prevState,
				errors: [{ dateTime, message: error.message, txid: error.txid ?? null }, ...(prevState.errors ?? [])],
				swapResult: false,
			}));
			throw new Error(error?.message ?? 'Unknown error');
		}

		if ('txid' in swapResult) {
			const { inputToken, outputToken, slippage } = blocklyState;
			const { inAmount, outAmount } = bestRoute;
			set(prevState => ({
				...prevState,
				transactions: [
					{
						dateTime,
						txid: swapResult.txid,
						param: {
							inputToken,
							outputToken,
							inAmount: fromDecimal(inAmount, inputToken?.decimals ?? 0),
							outAmount: fromDecimal(outAmount, outputToken?.decimals ?? 0),
							slippage: slippage ?? 0,
							routes: bestRoute.marketInfos.map(marketInfo => marketInfo.amm.label),
						},
					},
					...(prevState.transactions ?? []),
				],
				swapResult: true,
			}));
		}
	},
	clearTransaction: () => set({ transactions: [] }),
	clearErrors: () => set({ errors: [] }),
}));

export default JupStore;
export const useJupStore = convertStoreToHooks<JupStoreInt>(JupStore);
