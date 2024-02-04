import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

export const NETWORK = (process.env.NEXT_PUBLIC_CLUSTER ?? WalletAdapterNetwork.Devnet) as WalletAdapterNetwork;
export const RPC_ENDPOINT =
	NETWORK === 'devnet'
		? 'https://api.devnet.solana.com'
		: 'https://mainnet.helius-rpc.com/?api-key=4f68f267-9efa-461f-9d08-76121e9ac2f8';
