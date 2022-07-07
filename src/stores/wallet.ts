import * as React from 'react';
import { RPC_ENDPOINT } from '@constants/connection';
import { Connection, PublicKey, TokenAmount } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import create from 'zustand/vanilla';
import { WRAPPED_SOL } from '@constants/coin';
import { toDecimal } from '@utils/number';
import { SignerWalletAdapter } from '@solana/wallet-adapter-base';

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

interface WalletStoreInt {
	connection: Connection;
	wallet: SignerWalletAdapter | null;
	userBalances: Map<string, TokenAccountInfo>;
	init: () => void;
	getUserBalances: (walletPubKey: PublicKey) => Promise<void>;
	getBalance: (tokenMint: string) => string;
	setWallet: (wallet: SignerWalletAdapter) => void;
}

const WalletStore = create<WalletStoreInt>((set, get) => ({
	connection: new Connection(RPC_ENDPOINT),
	userBalances: new Map(),
	wallet: null,
	init: async () => {},
	getUserBalances: async (walletPubKey: PublicKey) => {
		const { connection } = get();

		const { value: nativeValue } = await connection.getParsedAccountInfo(walletPubKey, 'confirmed');
		const { value: accountsValue } = await connection.getParsedTokenAccountsByOwner(
			walletPubKey,
			{
				programId: TOKEN_PROGRAM_ID,
			},
			'confirmed'
		);

		const nativeBalanceLamport = nativeValue?.lamports ?? 0;
		const nativeBalance = toDecimal(nativeBalanceLamport, 9);
		const initialUserBalancesMap = new Map<string, TokenAccountInfo>();
		initialUserBalancesMap.set(walletPubKey.toBase58(), {
			pubkey: walletPubKey,
			info: {
				isNative: true,
				mint: WRAPPED_SOL.address,
				owner: walletPubKey.toBase58(),
				state: 'initialized',
				tokenAmount: {
					amount: `${nativeBalanceLamport}`,
					decimals: 9,
					uiAmount: nativeBalance,
					uiAmountString: `${nativeBalance}`,
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
	getBalance: (tokenMint: string) => {
		const { userBalances } = get();

		const tokenAccountInfo = userBalances.get(tokenMint);
		return tokenAccountInfo?.info.tokenAmount.uiAmountString ?? '0';
	},
	setWallet: (wallet: SignerWalletAdapter) => {
		const { getUserBalances } = get();

		if (!wallet.publicKey) return;

		getUserBalances(wallet.publicKey);
		set({ wallet });
	},
}));

export default WalletStore;
export const useWalletStore = () => {
	const [state, setState] = React.useState<WalletStoreInt>(WalletStore.getState());

	React.useEffect(() => {
		WalletStore.subscribe((nextState: WalletStoreInt, prevState: WalletStoreInt) => {
			if (nextState === prevState) return;

			setState(nextState);
		});
	}, []);

	return { ...state, setState: WalletStore.setState };
};
