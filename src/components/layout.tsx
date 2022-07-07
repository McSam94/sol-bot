import * as React from 'react';
import WalletButton from './common/wallet';
import RunPanel from './pages/run-panel';

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
	return (
		<div className='flex flex-col max-w-full min-h-screen'>
			<div className='flex flex-row items-center bg-black justify-between w-full px-10 h-20 shadow-md text-white'>
				<div className='text-xl font-bold'>Jupiter Bot</div>
				<WalletButton />
			</div>
			<div className='flex flex-row' style={{ height: 'calc(100vh - 80px)' }}>
				<div className='flex flex-1'>{children}</div>
				<div className='flex w-80'>
					<RunPanel />
				</div>
			</div>
		</div>
	);
};

export default React.memo(Layout);
