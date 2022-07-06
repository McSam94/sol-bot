import * as React from 'react';
import classNames from 'classnames';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

interface WalletButtonProps {
	className?: string;
}

const WalletButton: React.FC<WalletButtonProps> = ({ className }) => {
	return <WalletMultiButton className={classNames(className)} />;
};

export default WalletButton;
