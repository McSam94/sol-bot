import * as React from 'react';
import { ConnectionProvider } from '@solana/wallet-adapter-react';
import { RPC_ENDPOINT } from '@constants/connection';
import UseQueryProvider from './use-query';
import SolanaProvider from './wallet';
import BlocklyProvider from './blockly';

const ContextProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
	return (
		<ConnectionProvider endpoint={RPC_ENDPOINT}>
			<UseQueryProvider>
				<SolanaProvider>
					<BlocklyProvider>{children}</BlocklyProvider>
				</SolanaProvider>
			</UseQueryProvider>
		</ConnectionProvider>
	);
};

export default React.memo(ContextProvider);
