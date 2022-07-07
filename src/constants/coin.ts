import { PublicKey } from '@solana/web3.js';
import { ENV, TokenInfo } from '@solana/spl-token-registry';

export const WRAPPED_SOL: TokenInfo = {
	chainId: ENV.MainnetBeta,
	address: 'So11111111111111111111111111111111111111112',
	decimals: 9,
	name: 'Wrapped SOL',
	symbol: 'SOL',
	logoURI: '/coins/sol.svg',
	extensions: {
		coingeckoId: 'solana',
	},
};

export const DEVNET_COIN = [
	{
		chainId: ENV.Devnet,
		address: 'So11111111111111111111111111111111111111112',
		decimals: 9,
		name: 'Wrapped SOL',
		symbol: 'SOL',
		logoURI: '/coins/sol.svg',
		extensions: {
			coingeckoId: 'solana',
		},
	},
	{
		chainId: ENV.Devnet,
		address: 'G6YKv19AeGZ6pUYUwY9D7n4Ry9ESNFa376YqwEkUkhbi',
		decimals: 6,
		name: 'USD Coin',
		symbol: 'USDC',
		logoURI: '/coins/usdc.svg',
		extensions: {
			coingeckoId: 'usd-coin',
		},
	},
	{
		chainId: ENV.Devnet,
		address: '9NGDi2tZtNmCCp8SVLKNuGjuWAVwNF3Vap5tT8km5er9',
		decimals: 9,
		name: 'USDT',
		symbol: 'USDT',
		logoURI: '/coins/usdt.svg',
		extensions: {
			coingeckoId: 'tether',
		},
	},
];
