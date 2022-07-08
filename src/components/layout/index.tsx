import * as React from 'react';
import Image from 'next/image';
import { Wallet } from '../common';
import RunPanel from './run-panel';

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
	return (
		<div className='flex flex-col max-w-full min-h-screen'>
			<div className='flex flex-row items-center bg-black justify-between w-full px-10 h-20 shadow-md text-white'>
				<div className='flex flex-row items-center space-x-2'>
					<Image src='/logo.svg' alt='logo' width={30} height={30} />
					<div className='text-xl font-bold hidden lg:block'>Jupiter Bot</div>
				</div>
				<Wallet />
			</div>
			<div className='flex flex-row' style={{ height: 'calc(100vh - 80px)' }}>
				<div className='flex lg:hidden justify-center items-center w-full font-semibold text-md'>{`Sorry, mobile currently not support yet :(`}</div>
				<div className='hidden lg:flex flex-1'>{children}</div>
				<div className='hidden lg:flex w-80'>
					<RunPanel />
				</div>
			</div>
		</div>
	);
};

export default React.memo(Layout);
