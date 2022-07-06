import * as React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useJupStore } from '@blockly/store/jupiter';
import { useBlockly } from '@contexts/blockly';
import WalletButton from '@components/common/wallet';

const RunPanel: React.FC = () => {
	const { connected } = useWallet();
	const { txids, errors, botStatus } = useJupStore();
	const { runBot, stopBot, saveWorkspace, loadWorkspace } = useBlockly();

	const uploadRef = React.useRef<HTMLInputElement | null>(null);

	return (
		<div className='flex flex-col space-y-4 py-10 px-8 w-full h-full'>
			<div className='flex flex-col border-b'>
				<div className='text-md font-semibold text-center mb-2'>{`Status: ${botStatus}`}</div>
				{connected ? (
					<button
						className='border bg-black text-white px-10 py-2 rounded-lg'
						disabled={!connected}
						onClick={botStatus === 'running' ? stopBot : runBot}
					>
						{botStatus === 'running' ? 'Stop' : 'Run'}
					</button>
				) : (
					<WalletButton />
				)}

				<button className='border bg-black text-white px-10 py-2 rounded-lg' onClick={saveWorkspace}>
					Save
				</button>

				<input
					ref={uploadRef}
					type='file'
					accept='.xml'
					className='w-40 hidden'
					onChange={loadWorkspace}
				></input>
				<button
					className='border bg-black text-white px-10 py-2 rounded-lg'
					onClick={() => uploadRef.current?.click?.()}
				>
					Load
				</button>
			</div>
			<div className='text-md font-bold'>Transactions</div>
			<div className='flex flex-col space-y-4 border-b pb-4'>
				{txids?.reverse()?.map((txid, idx) => (
					<div key={txid} className='text-sm flex flex-col'>
						<span className='text-xs text-black/50'>{`${new Date().toLocaleTimeString()}`}</span>
						<a href={`https://explorer.solana.com/tx/${txid}`} target='_blank' rel='noreferrer'>
							Solscan
						</a>
					</div>
				))}
			</div>
			<div className='text-md font-bold'>Errors</div>
			<div className='flex flex-col space-y-4'>
				{errors?.reverse()?.map((error, idx) => (
					<div key={`${error.toString()}_${idx}`} className='text-sm flex flex-col'>
						<span className='text-xs text-black/50'>{`${new Date().toLocaleTimeString()}`}</span>
						<span>{`${error.toString()}`}</span>
					</div>
				))}
			</div>
		</div>
	);
};

export default React.memo(RunPanel);
