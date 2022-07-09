import * as React from 'react';
import { Cluster, Connection, PublicKey, TransactionError as Web3TransactionError } from '@solana/web3.js';
import { Jupiter, RouteInfo, SwapResult, TOKEN_LIST_URL } from '@jup-ag/core';
import { SignerWalletAdapter, WalletAdapter } from '@solana/wallet-adapter-base';
import create from 'zustand/vanilla';
import startCase from 'lodash.startcase';
import { NETWORK, RPC_ENDPOINT } from '@constants/connection';
import { ROUTES_PROPS } from '@constants/routes';
import { convertStoreToHooks } from '@utils/store';
import { CustomDropdownOption } from '@blockly/fields/dropdown';

interface Token {
	chainId: number;
	address: string;
	symbol: string;
	name: string;
	decimals: number;
	logoURI: string;
	tags: string[];
}

export interface BlocklyState {
	inputMint: string | undefined;
	outputMint: string | undefined;
	amount: number | undefined;
	slippage: number | undefined;
	selectedRouteIndex: number | undefined;
	shouldSwap: boolean | undefined;
	shouldTradeAgain: boolean | undefined;
}

interface ImageDropdown {
	src: string;
	width: number;
	height: number;
	alt: string;
}

interface TransactionHistory {
	dateTime: string;
	txid: string;
}

interface TransactionError {
	message: string;
	txid: string | null;
	dateTime: string;
}

interface JupStoreInt {
	jupiter: Jupiter | null;
	routeMap: Map<string, string[]> | null;
	computedRoutes: Array<RouteInfo> | null;
	computedRoutesLastFetch: Date | null;
	cacheSecond: number;
	tokens: Array<Token> | null;
	blocklyState: BlocklyState;
	txids: Array<TransactionHistory> | null;
	errors: Array<TransactionError> | null;
	init: () => Promise<void>;
	getTokensDropdown: () => Array<CustomDropdownOption> | undefined;
	getAvailablePairedTokenDropdown: (inputMint: string) => Array<CustomDropdownOption> | undefined;
	getRoutePropDropdown: () => Array<CustomDropdownOption> | undefined;
	getComputedRoutes: () => Promise<Array<RouteInfo> | null>;
	setWallet: (wallet: SignerWalletAdapter) => void;
	exchange: (wallet: SignerWalletAdapter) => Promise<void>;
}

const initialBlocklyState = {
	inputMint: undefined,
	outputMint: undefined,
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
	cacheSecond: 10,
	tokens: null,
	txids: null,
	errors: null,
	blocklyState: initialBlocklyState,
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
		get().tokens?.map(({ logoURI, symbol, address }) => ({ img: logoURI, label: symbol, value: address })),
	getAvailablePairedTokenDropdown: (inputMint: string) => {
		const { tokens, routeMap } = get();
		const possiblePairedToken = routeMap?.get(inputMint);

		return possiblePairedToken
			?.map(address => {
				const token = tokens?.find(token => token.address === address);

				if (!token) return undefined;

				return {
					img: token.logoURI,
					label: token.symbol,
					value: token.address,
				};
			})
			.filter(Boolean);
	},
	getRoutePropDropdown: () =>
		Object.entries(ROUTES_PROPS)
			.map(([key, value]) => ({ label: startCase(key), value }))
			.filter(Boolean),
	getComputedRoutes: async () => {
		const { blocklyState, tokens, jupiter, computedRoutesLastFetch, cacheSecond, computedRoutes } = get();

		const now = new Date().getTime();
		const previouslyFetchTimestamp = computedRoutesLastFetch?.getTime() ?? new Date().getTime();
		if (computedRoutesLastFetch && (now - previouslyFetchTimestamp) / 1000 < cacheSecond) {
			return computedRoutes;
		}

		const { inputMint, outputMint, amount, slippage } = blocklyState;
		const inputToken = tokens?.find(token => token.address === inputMint);

		const amountNum = +(amount ?? 0);
		const slippageNum = +(slippage ?? 0);
		if (!inputToken || !inputMint || !outputMint || !amountNum || !slippageNum) return null;

		const newComputedRoutes: Array<RouteInfo> | null =
			(
				await jupiter?.computeRoutes({
					inputMint: new PublicKey(inputMint),
					outputMint: new PublicKey(outputMint),
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
		const { jupiter, computedRoutes } = get();

		if (!jupiter) throw new Error('Jupiter not initialized');
		if (!computedRoutes) throw new Error('Best route not found');
		if (!wallet) throw new Error('Wallet not found');

		const { execute } = await jupiter?.exchange({
			routeInfo: computedRoutes[0],
		});

		const swapResult: SwapResult = await execute({
			wallet,
		});
		console.log('🚀 ~ swapResult', swapResult);

		const dateTime = new Date().toLocaleTimeString();
		if ('error' in swapResult) {
			const { error } = swapResult;
			if (!error) return;
			set(prevState => ({
				...prevState,
				errors: [{ dateTime, message: error.message, txid: error.txid ?? null }, ...(prevState.errors ?? [])],
			}));
			throw new Error(error?.message ?? 'Unknown error');
		}

		if ('txid' in swapResult) {
			set(prevState => ({
				...prevState,
				txids: [{ dateTime, txid: swapResult.txid }, ...(prevState.txids ?? [])],
			}));
		}
	},
}));

export default JupStore;
export const useJupStore = convertStoreToHooks<JupStoreInt>(JupStore);
