import * as React from 'react';
import { WalletProvider } from '@solana/wallet-adapter-react';
import {
	CoinbaseWalletAdapter,
	GlowWalletAdapter,
	PhantomWalletAdapter,
	SolflareWalletAdapter,
	TorusWalletAdapter,
	SolletExtensionWalletAdapter,
	SolletWalletAdapter,
} from '@solana/wallet-adapter-wallets';
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
			new SolletWalletAdapter({ network: NETWORK }),
			new SolletExtensionWalletAdapter({ network: NETWORK }),
			new SolflareWalletAdapter({ network: NETWORK }),
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
