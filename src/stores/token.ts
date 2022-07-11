import { RPC_ENDPOINT } from '@constants/connection';
import { Connection, PublicKey, TokenAmount } from '@solana/web3.js';
import { SignerWalletAdapter } from '@solana/wallet-adapter-base';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import create from 'zustand/vanilla';
import { CoinGeckoClient, CoinListResponseItem } from 'coingecko-api-v3';
import { WRAPPED_SOL } from '@constants/coin';
import { fromDecimal } from '@utils/number';
import { convertStoreToHooks } from '@utils/store';
import { CustomDropdownOption } from '@blockly/fields/dropdown';

const coinGeckoClient = new CoinGeckoClient({
	timeout: 10000,
	autoRetry: true,
});

interface TokenAccountInfo {
	pubkey: PublicKey;
	info: {
		isNative: boolean;
		mint: string;
		owner: string;
		state: string;
		tokenAmount: TokenAmount;
	};
}

interface TokenStoreInt {
	connection: Connection;
	userBalances: Map<string, TokenAccountInfo>;
	wallet: SignerWalletAdapter | null;
	coins: Array<CoinListResponseItem> | null;
	currencies: Array<string> | null;
	init: () => void;
	getUserBalances: (walletPubKey: PublicKey) => Promise<void>;
	getBalance: (wallet: SignerWalletAdapter, tokenMint: string) => Promise<number>;
	setWallet: (wallet: SignerWalletAdapter) => void;
	getCoinDropdown: () => Array<CustomDropdownOption> | undefined;
	getCurrencyDropdown: () => Array<CustomDropdownOption> | undefined;
	getTokenPrice: (tokenMint: string, currency: string) => Promise<number>;
}

const TokenStore = create<TokenStoreInt>((set, get) => ({
	connection: new Connection(RPC_ENDPOINT),
	userBalances: new Map(),
	wallet: null,
	coins: null,
	currencies: null,
	init: async () => {
		const coins = await coinGeckoClient.coinList({ include_platform: false });
		const currencies = await coinGeckoClient.simpleSupportedCurrencies();

		set({ coins, currencies });
	},
	getUserBalances: async (walletPubKey: PublicKey) => {
		const { connection } = get();

		const nativeBalance = await connection.getBalance(walletPubKey, 'confirmed');
		const { value: accountsValue } = await connection.getParsedTokenAccountsByOwner(
			walletPubKey,
			{
				programId: TOKEN_PROGRAM_ID,
			},
			'confirmed'
		);

		const initialUserBalancesMap = new Map<string, TokenAccountInfo>();
		const solBalance = fromDecimal(nativeBalance, 9);
		initialUserBalancesMap.set(WRAPPED_SOL.address, {
			pubkey: walletPubKey,
			info: {
				isNative: true,
				mint: WRAPPED_SOL.address,
				owner: walletPubKey.toBase58(),
				state: 'initialized',
				tokenAmount: {
					amount: `${nativeBalance}`,
					decimals: 9,
					uiAmount: solBalance,
					uiAmountString: `${solBalance}`,
				},
			},
		});
		const userBalances = accountsValue.reduce<Map<string, TokenAccountInfo>>(
			(
				accValue,
				{
					account: {
						data: { parsed },
					},
				}
			) => {
				accValue.set(parsed.info.mint, parsed);

				return accValue;
			},
			new Map(initialUserBalancesMap)
		);

		set({ userBalances });
	},
	getBalance: async (wallet: SignerWalletAdapter, tokenMint: string) => {
		const { connection } = get();

		if (!wallet.publicKey) return null;

		if (tokenMint === WRAPPED_SOL.address) {
			const nativeBalance = await connection.getBalance(wallet.publicKey, 'confirmed');
			return fromDecimal(nativeBalance, 9);
		}

		const { value: accountsValue } = await connection.getParsedTokenAccountsByOwner(
			wallet.publicKey,
			{
				programId: TOKEN_PROGRAM_ID,
			},
			'confirmed'
		);

		const accountValue = accountsValue.find(({ account }) => account.data.parsed.info.mint === tokenMint);

		return accountValue?.account.data.parsed.info.tokenAmount.uiAmount ?? 0;
	},
	setWallet: (wallet: SignerWalletAdapter) => {
		const { getUserBalances } = get();

		if (!wallet.publicKey) return;

		getUserBalances(wallet.publicKey);
		set({ wallet });
	},
	getCoinDropdown: () => {
		return (
			get().coins?.map(({ name, symbol, id }) => ({
				label: `${name} (${symbol?.toUpperCase()})` ?? '',
				value: id ?? '',
			})) ?? []
		);
	},
	getCurrencyDropdown: () => {
		return get().currencies?.map(currency => ({ label: currency.toUpperCase(), value: currency }));
	},
	getTokenPrice: async (tokenId: string, currency: string) => {
		const price = await coinGeckoClient.simplePrice({ ids: tokenId, vs_currencies: currency });

		return price[tokenId][currency];
	},
}));

export default TokenStore;
export const useTokenStore = convertStoreToHooks<TokenStoreInt>(TokenStore);
