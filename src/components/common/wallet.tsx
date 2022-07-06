import * as React from 'react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const WalletButton: React.FC = () => {
	return (
		<WalletModalProvider>
			<WalletMultiButton style={{ color: 'black' }} />
		</WalletModalProvider>
	);
};

export default WalletButton;
