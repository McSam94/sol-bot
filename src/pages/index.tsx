import * as React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';

const Home: NextPage = () => {
	return (
		<>
			<Head>
				<title>Jupiter Bot</title>
				<meta name='description' content='Automate solana exchange without programming.' />
			</Head>
			<div id='blocklyDiv' className='h-full w-full'></div>
		</>
	);
};

export default Home;
