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
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
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
			new SolflareWalletAdapter({ network: NETWORK as WalletAdapterNetwork }),
			new TorusWalletAdapter(),
		],
		[]
	);

	return (
		<WalletProvider wallets={wallets} autoConnect>
			<WalletModalProvider>{children}</WalletModalProvider>
		</WalletProvider>
	);
};

export default SolanaProvider;
