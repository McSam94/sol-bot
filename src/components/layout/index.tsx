import Image from 'next/image';
import * as React from 'react';
import Header from './header';
import RunPanel from './run-panel';

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
	return (
		<div className='flex flex-col max-w-full min-h-screen relative'>
			<Header />
			<div className='flex flex-row' style={{ height: 'calc(100vh - 80px)' }}>
				<div className='flex lg:hidden justify-center items-center w-full font-semibold text-md'>{`Sorry, mobile currently not support yet :(`}</div>
				<div className='hidden lg:flex flex-1'>{children}</div>
				<div className='hidden lg:flex w-80'>
					<RunPanel />
				</div>
			</div>

			<div className='flex absolute bottom-2 left-2 z-100'>
				<Image src='/credit/blockly.svg' alt='blockly' width={100} height={50} />
			</div>
		</div>
	);
};

export default React.memo(Layout);
