import * as React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useBlockly } from '@contexts/blockly';
import WorkspaceSkeleton from '@components/skeleton/workspace';

const Home: NextPage = () => {
	const { workspace } = useBlockly();

	return (
		<>
			<Head>
				<title>Jupiter Bot</title>
				<meta name='description' content='Automate solana exchange without programming.' />
			</Head>
			<div id='blocklyDiv' className='h-full w-full'>
				{true ? (
					<div className='flex flex-row h-full'>
						<div className='animate-pulse h-full w-[181px] bg-gray-300' />
						<div className='flex'>
							<WorkspaceSkeleton />
						</div>
					</div>
				) : null}
			</div>
		</>
	);
};

export default Home;
