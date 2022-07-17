import { RouteInfo } from '@jup-ag/core';

export type RouteProp = keyof RouteInfo | 'inAmountLamport' | 'outAmountLamport' | 'otherAmountThresholdLamport';

export const ROUTES_PROPS: Record<string, RouteProp> = Object.freeze({
	'In Amount (Lamport)': 'inAmountLamport',
	'In Amount': 'inAmount',
	'Out Amount (Lamport)': 'outAmountLamport',
	'Out Amount': 'outAmount',
	'Out Amount With Slippage': 'otherAmountThreshold',
	'Out Amount With Slippage (Lamport)': 'otherAmountThresholdLamport',
	'Price Impact PCT': 'priceImpactPct',
});

export declare enum SwapMode {
	ExactIn = 'ExactIn',
	ExactOut = 'ExactOut',
}
