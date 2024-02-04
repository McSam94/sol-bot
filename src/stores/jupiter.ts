import JSBI from 'jsbi';
import { DefaultApi, QuoteResponse, createJupiterApiClient } from '@jup-ag/api';
import create from 'zustand/vanilla';
import { CustomDropdownOption } from '@blockly/fields/dropdown';
import { convertStoreToHooks } from '@utils/store';
import { fromDecimal, toDecimal } from '@utils/number';
import { Connection, PublicKey, VersionedTransaction } from '@solana/web3.js';
import promiseRetry from 'promise-retry';
import { TransactionError, handleSendTransaction } from '@mercurial-finance/optimist';
import { IDL_V6 } from 'src/idl/jupiter6';
import { JUPITER_PROGRAM_V6_ID } from '@constants/program';

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

interface TransactionErrorUI {
	dateTime: Date;
	message: string;
	txid: string | null;
}

interface JupStoreInt {
	jupiter: DefaultApi | null;
	quote: QuoteResponse | null;
	cacheSecond: number;
	tokens: Array<Token> | null;
	blocklyState: BlocklyState;
	transactions: Array<TransactionHistory> | null;
	errors: Array<TransactionErrorUI> | null;
	swapResult: boolean | null;
	init: () => Promise<void>;
	getTokensDropdown: () => Array<CustomDropdownOption> | undefined;
	getComputedRoutes: () => Promise<QuoteResponse | null>;
	exchange: (wallet: PublicKey, connection: Connection) => Promise<void>;
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
	quote: null,
	cacheSecond: 0,
	tokens: null,
	transactions: null,
	errors: null,
	blocklyState: initialBlocklyState,
	swapResult: null,
	init: async () => {
		const tokens = await fetch('https://token.jup.ag/all').then(res => res.json());
		const jupiter = await createJupiterApiClient();
		set({ jupiter, tokens });
	},
	getTokensDropdown: () =>
		get().tokens?.map(({ logoURI, name, symbol, address }) => ({
			img: logoURI,
			label: `${name} (${symbol})`,
			value: address,
		})),
	getComputedRoutes: async () => {
		const { blocklyState, jupiter } = get();

		const { inputToken, outputToken, amount, slippage } = blocklyState;

		const amountNum = +(amount ?? 0);
		const slippageNum = +(slippage ?? 0);
		if (!inputToken || !outputToken || !amountNum || !slippageNum) return null;

		const inputAmountLamport = toDecimal(amountNum, inputToken.decimals);
		const quote = await jupiter?.quoteGet({
			inputMint: inputToken.address,
			outputMint: outputToken.address,
			amount: inputAmountLamport,
			slippageBps: slippageNum,
			onlyDirectRoutes: false,
			asLegacyTransaction: false,
		});

		// JsInterpreter can't convert RouteInfo properly so passed through zustand
		set({ quote });

		if (!quote) return null;

		return quote;
	},
	exchange: async (wallet: PublicKey, connection: Connection) => {
		const { jupiter, quote, blocklyState } = get();

		if (!jupiter) throw new Error('Jupiter not initialized');
		if (!quote) throw new Error('Route not found');
		if (!wallet) throw new Error('Wallet not found');

		const swapResult = await promiseRetry(
			retry =>
				jupiter
					?.swapPost({
						swapRequest: {
							quoteResponse: quote,
							userPublicKey: wallet.toBase58(),
							wrapAndUnwrapSol: true,
							dynamicComputeUnitLimit: true,
						},
					})
					.catch(async res => {
						try {
							// probably an error with the quote so we dont retry
							const { error } = await res.json();
							return { error: new TransactionError(error) };
						} catch (e) {
							// probably json is not parsable or the res is not an response object.
							return retry({
								error: new TransactionError('Unknown error'),
							});
						}
					}),
			{
				retries: 1,
				minTimeout: 100,
			}
		);

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

		const swapTransactionBuf = Buffer.from(swapResult.swapTransaction, 'base64');
		const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

		const dateTime = new Date();
		const blockhashWithExpiryBlockHeight = {
			blockhash: transaction.message.recentBlockhash,
			lastValidBlockHeight: swapResult.lastValidBlockHeight,
		};
		try {
			const transactionResponse = await handleSendTransaction({
				...blockhashWithExpiryBlockHeight,
				connection,
				signedTransaction: transaction,
				idl: IDL_V6,
				idlProgramId: JUPITER_PROGRAM_V6_ID,
				skipPreflight: true,
			});

			if ('txid' in transactionResponse) {
				const { inputToken, outputToken, slippage } = blocklyState;
				const { inAmount, outAmount } = quote;
				set(prevState => ({
					...prevState,
					transactions: [
						{
							dateTime,
							txid: transactionResponse?.txid ?? '',
							param: {
								inputToken,
								outputToken,
								inAmount: fromDecimal(Number(inAmount), inputToken?.decimals ?? 0),
								outAmount: fromDecimal(Number(outAmount), outputToken?.decimals ?? 0),
								slippage: slippage ?? 0,
								routes: quote.routePlan.map(plan => plan.swapInfo.label ?? ''),
							},
						},
						...(prevState.transactions ?? []),
					],
					swapResult: true,
				}));
			}
		} catch (error: any) {
			set(prevState => ({
				...prevState,
				errors: [{ dateTime, message: error.message, txid: error.txid ?? null }, ...(prevState.errors ?? [])],
				swapResult: false,
			}));
			throw new Error(error?.message ?? 'Unknown error');
		}
	},
	clearTransaction: () => set({ transactions: [] }),
	clearErrors: () => set({ errors: [] }),
}));

export default JupStore;
export const useJupStore = convertStoreToHooks<JupStoreInt>(JupStore);
