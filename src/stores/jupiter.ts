import * as React from 'react';
import { Cluster, Connection, PublicKey, TransactionError } from '@solana/web3.js';
import { Jupiter, RouteInfo, SwapResult, TOKEN_LIST_URL } from '@jup-ag/core';
import { SignerWalletAdapter, WalletAdapter } from '@solana/wallet-adapter-base';
import create from 'zustand/vanilla';
import startCase from 'lodash.startcase';
import { NETWORK, RPC_ENDPOINT } from '@constants/connection';
import { ROUTES_PROPS } from '@constants/routes';

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

type TokensDropdown = Array<Array<string | ImageDropdown>>;

type routePropDropdown = Array<Array<string>>;

export interface JupStoreInt {
	jupiter: Jupiter | null;
	routeMap: Map<string, string[]> | null;
	bestRoute: RouteInfo | null;
	tokens: Array<Token> | null;
	blocklyState: BlocklyState;
	txids: Array<string> | null;
	errors: Array<TransactionError> | null;
	botStatus: 'running' | 'stopping' | 'idle';
	init: () => Promise<void>;
	getTokensDropdown: () => TokensDropdown | undefined;
	getAvailablePairedTokenDropdown: (inputMint: string) => TokensDropdown | undefined;
	getRoutePropDropdown: () => routePropDropdown | undefined;
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
	bestRoute: null,
	tokens: null,
	txids: null,
	errors: null,
	blocklyState: initialBlocklyState,
	botStatus: 'idle',
	init: async () => {
		const tokens = await fetch(TOKEN_LIST_URL[NETWORK as Cluster]).then(res => res.json());
		const jupiter = await Jupiter.load({
			connection: new Connection(RPC_ENDPOINT),
			cluster: NETWORK as Cluster,
		});
		const routeMap = jupiter.getRouteMap();
		set({ jupiter, tokens, routeMap });
	},
	getTokensDropdown: (): TokensDropdown | undefined => get().tokens?.map(token => [token.name, token.address]),
	getAvailablePairedTokenDropdown: (inputMint: string): TokensDropdown | undefined => {
		const { tokens, routeMap } = get();
		const possiblePairedToken = routeMap?.get(inputMint);

		return possiblePairedToken
			?.map(address => {
				const token = tokens?.find(token => token.address === address);

				if (!token) return undefined;

				return [token?.name, token?.address];
			})
			.filter(Boolean);
	},
	getRoutePropDropdown: (): routePropDropdown | undefined =>
		Object.entries(ROUTES_PROPS)
			.map(([key, value]) => [startCase(key), `${value}`])
			.filter(Boolean),
	getComputedRoutes: async () => {
		const { blocklyState, tokens, jupiter } = get();
		const { inputMint, outputMint, amount, slippage } = blocklyState;
		const inputToken = tokens?.find(token => token.address === inputMint);

		const amountNum = +(amount ?? 0);
		const slippageNum = +(slippage ?? 0);
		if (!inputToken || !inputMint || !outputMint || !amountNum || !slippageNum) return null;

		const computedRoutes: Array<RouteInfo> | null =
			(
				await jupiter?.computeRoutes({
					inputMint: new PublicKey(inputMint),
					outputMint: new PublicKey(outputMint),
					inputAmount: amountNum * 10 ** inputToken.decimals,
					slippage: slippageNum,
				})
			)?.routesInfos ?? null;

		// JsInterpreter can't convert RouteInfo properly so passed through zustand
		set({ bestRoute: computedRoutes?.[0] ?? null });
		return computedRoutes;
	},
	setWallet: (wallet: SignerWalletAdapter) => {
		const { jupiter } = get();

		jupiter?.setUserPublicKey(wallet.publicKey ?? PublicKey.default);
		set({ jupiter });
	},
	exchange: async (wallet: SignerWalletAdapter) => {
		const { jupiter, bestRoute } = get();

		if (!jupiter) throw new Error('Jupiter not initialized');
		if (!bestRoute) throw new Error('Best route not found');
		if (!wallet) throw new Error('Wallet not found');

		const { execute } = await jupiter?.exchange({
			routeInfo: bestRoute,
		});

		const swapResult: SwapResult = await execute({
			wallet,
		});
		console.log('🚀 ~ swapResult', swapResult);

		if ('error' in swapResult) {
			const error: TransactionError | undefined = swapResult.error;
			if (!error) return;
			set(prevState => ({ ...prevState, errors: [...(prevState.errors ?? []), error] }));
		}

		if ('txid' in swapResult) {
			set(prevState => ({ ...prevState, txids: [...(prevState.txids ?? []), swapResult.txid] }));
		}
	},
}));

export default JupStore;
export const useJupStore = () => {
	const [state, setState] = React.useState<JupStoreInt>(JupStore.getState());

	React.useEffect(() => {
		JupStore.subscribe((nextState: JupStoreInt, prevState: JupStoreInt) => {
			if (nextState === prevState) return;

			setState(nextState);
		});
	}, []);

	return { ...state, setState: JupStore.setState };
};
