import { RouteInfo } from '@jup-ag/core';

export type RouteProp = keyof RouteInfo | 'inAmountLamport' | 'outAmountLamport' | 'outAmountWithSlippageLamport';

export const ROUTES_PROPS: Record<string, RouteProp> = Object.freeze({
	'In Amount (Lamport)': 'inAmountLamport',
	'In Amount': 'inAmount',
	'Out Amount (Lamport)': 'outAmountLamport',
	'Out Amount': 'outAmount',
	'Out Amount With Slippage': 'outAmountWithSlippage',
	'Out Amount With Slippage (Lamport)': 'outAmountWithSlippageLamport',
	'Price Impact PCT': 'priceImpactPct',
});
