import * as React from 'react';
import { WalletProvider } from '@solana/wallet-adapter-react';
import {
	CoinbaseWalletAdapter,
	GlowWalletAdapter,
	PhantomWalletAdapter,
	SlopeWalletAdapter,
	SolflareWalletAdapter,
	TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { createDefaultAuthorizationResultCache, SolanaMobileWalletAdapter } from '@solana-mobile/wallet-adapter-mobile';
import { NETWORK } from '@constants/connection';

require('@solana/wallet-adapter-react-ui/styles.css');

const SolanaProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
	const wallets = React.useMemo(
		() => [
			new SolanaMobileWalletAdapter({
				appIdentity: { name: 'Solana Wallet Adapter App' },
				authorizationResultCache: createDefaultAuthorizationResultCache(),
			}),
			new CoinbaseWalletAdapter(),
			new PhantomWalletAdapter(),
			new GlowWalletAdapter(),
			new SlopeWalletAdapter(),
			new SolflareWalletAdapter({ network: NETWORK }),
			new TorusWalletAdapter(),
		],
		[]
	);

	return (
		<WalletProvider wallets={wallets} autoConnect>
			{children}
		</WalletProvider>
	);
};

export default SolanaProvider;
