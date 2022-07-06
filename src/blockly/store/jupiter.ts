import * as React from 'react';
import { Cluster, Connection, PublicKey, TransactionError } from '@solana/web3.js';
import { Jupiter, RouteInfo, SwapResult, TOKEN_LIST_URL } from '@jup-ag/core';
import { SignerWalletAdapter, WalletAdapter } from '@solana/wallet-adapter-base';
import create from 'zustand/vanilla';
import startCase from 'lodash.startcase';
import { NETWORK, RPC_ENDPOINT } from '@constants/connection';
import { ROUTES_PROPS } from '@constants/routes';

interface Token {
	chainId: number; // 101,
	address: string; // 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
	symbol: string; // 'USDC',
	name: string; // 'Wrapped USDC',
	decimals: number; // 6,
	logoURI: string; // 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/BXXkv6z8ykpG1yuvUDPgh732wzVHB69RnB9YgSYh3itW/logo.png',
	tags: string[]; // [ 'stablecoin' ]
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
	wallet: SignerWalletAdapter | null;
	routeMap: Map<string, string[]> | null;
	tokens: Array<Token> | null;
	bestRoute: RouteInfo | null;
	blocklyState: BlocklyState;
	txids: Array<string> | null;
	errors: Array<TransactionError> | null;
	botStatus: 'running' | 'stopping' | 'idle';
	getTokensDropdown: () => TokensDropdown | undefined;
	getAvailablePairedTokenDropdown: (inputMint: string) => TokensDropdown | undefined;
	getRoutePropDropdown: () => routePropDropdown | undefined;
	getComputedRoutes: () => Promise<Array<RouteInfo> | null>;
	init: (walletPubKey: PublicKey | null) => Promise<void>;
	setWallet: (wallet: SignerWalletAdapter) => void;
	exchangeBestRoute: () => Promise<void>;
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
	tokens: null,
	bestRoute: null,
	txids: null,
	errors: null,
	blocklyState: initialBlocklyState,
	botStatus: 'idle',
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
	init: async (walletPubKey: PublicKey | null) => {
		const tokens = await fetch(TOKEN_LIST_URL[NETWORK as Cluster]).then(res => res.json());
		const jupiter = await Jupiter.load({
			connection: new Connection(RPC_ENDPOINT),
			cluster: NETWORK as Cluster,
			...(walletPubKey ? { user: walletPubKey } : {}),
		});
		const routeMap = jupiter.getRouteMap();
		set({ jupiter, tokens, routeMap });
	},
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

		set({ bestRoute: computedRoutes?.[0] ?? null });
		return computedRoutes;
	},
	setWallet: (wallet: SignerWalletAdapter) => {
		const { jupiter } = get();

		jupiter?.setUserPublicKey(wallet.publicKey ?? PublicKey.default);
		set({ wallet, jupiter });
	},
	exchangeBestRoute: async () => {
		const { jupiter, bestRoute, wallet } = get();

		if (!jupiter) throw new Error('Jupiter not initialized');
		if (!bestRoute) throw new Error('Best route not found');
		if (!wallet) throw new Error('Wallet not found');

		const { execute } = await jupiter?.exchange({
			routeInfo: bestRoute,
		});

		const swapResult: SwapResult = await execute({
			wallet,
		});
		console.log('🚀 ~ file: jupiter.ts ~ line 138 ~ exchangeBestRoute: ~ swapResult', swapResult);

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
