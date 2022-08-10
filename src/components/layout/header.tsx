import * as React from 'react';
import Image from 'next/image';
import { Wallet } from '@components/common';
import Icon from '@components/common/Icon';
import Link from 'next/link';

const Header = () => {
	return (
		<div className='flex flex-row items-center bg-black w-full px-10 h-20 shadow-md text-white'>
			<div className='flex basis-1/3'>
				<Link href='https://discord.gg/eSuTAU6WTu' passHref>
					<a target='_blank'>
						<Icon name='discord' size={25} colorFn={({ hover }) => (hover ? '#7289da' : 'white')} />
					</a>
				</Link>
			</div>
			<div className='flex flex-row items-center justify-center space-x-2 basis-1/3 relative'>
				<Image src='/logo.svg' alt='logo' width={30} height={30} />
				<div className='text-xl font-bold hidden lg:block'>Sol Bot</div>
			</div>
			<div className='flex justify-end basis-1/3'>
				<Wallet />
			</div>
		</div>
	);
};

export default React.memo(Header);
