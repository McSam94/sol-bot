import Interpreter from 'js-interpreter-npm';
import TokenStore from '@stores/token';
import { SignerWalletAdapter } from '@solana/wallet-adapter-base';

const walletInterpreter = (jsInterpreter: typeof Interpreter, scope: any) => {
	// Set Wallet
	jsInterpreter.setProperty(
		scope,
		'getWallet',
		jsInterpreter.createNativeFunction(function () {
			const { wallet } = TokenStore.getState();
			return wallet;
		})
	);

	// Get Balance
	jsInterpreter.setProperty(
		scope,
		'getBalance',
		jsInterpreter.createAsyncFunction(function (
			wallet: SignerWalletAdapter,
			tokenMint: string,
			callback: Function
		) {
			TokenStore.getState()
				.getBalance(wallet, tokenMint)
				.then(balance => callback(balance));
		})
	);

	// Get Token Price
	jsInterpreter.setProperty(
		scope,
		'getTokenPrice',
		jsInterpreter.createAsyncFunction(function (tokenId: string, currency: string, callback: Function) {
			TokenStore.getState()
				.getTokenPrice(tokenId, currency)
				.then(price => callback(price))
				.catch(() => callback(0));
		})
	);
};

export default walletInterpreter;
