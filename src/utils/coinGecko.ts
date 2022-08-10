import { CoinGeckoClient } from 'coingecko-api-v3';
import { LOCAL } from '@constants/local';

const COIN_PRIZE_CACHE_SEC = 60 * 100 * 5;

export const coinGeckoClient = new CoinGeckoClient({
	timeout: 10000,
	autoRetry: true,
});

export const getCoinPrizeAndCurrency = async () => {
	const currentTimestamp = new Date().getTime();
	const lastFetchTimestamp = localStorage.getItem(LOCAL.LAST_COIN_FETCH_TIMESTAMP) ?? currentTimestamp;
	const lastFetchCoinPrize = localStorage.getItem(LOCAL.LAST_COIN_PRIZE);
	const lastFetchCurrencies = localStorage.getItem(LOCAL.CURRENCY);

	let currencies = lastFetchCurrencies ? JSON.parse(lastFetchCurrencies) : undefined;
	if (!currencies) {
		currencies = await coinGeckoClient.simpleSupportedCurrencies();
		localStorage.setItem(LOCAL.CURRENCY, JSON.stringify(currencies));
	}

	let coinPrizes = lastFetchCoinPrize ? JSON.parse(lastFetchCoinPrize) : undefined;
	if (currentTimestamp - +lastFetchTimestamp <= COIN_PRIZE_CACHE_SEC && coinPrizes) {
		return [coinPrizes, currencies];
	}

	coinPrizes = await coinGeckoClient.coinList({ include_platform: false });
	localStorage.setItem(LOCAL.LAST_COIN_PRIZE, JSON.stringify(coinPrizes));
	localStorage.setItem(LOCAL.LAST_COIN_FETCH_TIMESTAMP, currentTimestamp.toString());

	return [coinPrizes, currencies];
};
