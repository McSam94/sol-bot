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
		<div className='flex flex-col w-full h-full'>
			<div className='flex flex-col border-b h-60 items-center justify-center'>
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
			<div className='flex flex-col px-4 py-2' style={{ height: 'calc(100% - 240ppx)' }}>
				<div className='flex flex-col h-1/2 border-b'>
					<div className='text-md font-bold'>Transactions</div>
					<div className='flex flex-col space-y-4 h-full overflow-y-auto py-2'>
						{txids?.reverse()?.map((txid, idx) => (
							<div key={txid} className='text-sm flex flex-col'>
								<span className='text-xs text-black/50'>{`${new Date().toLocaleTimeString()}`}</span>
								<a
									className='underline'
									href={`https://explorer.solana.com/tx/${txid}`}
									target='_blank'
									rel='noreferrer'
								>
									Solscan
								</a>
							</div>
						)) ?? <div className='text-sm text-black/50'>No record found</div>}
					</div>
				</div>
				<div className='flex flex-col h-1/2'>
					<div className='text-md font-bold'>Errors</div>
					<div className='flex flex-col space-y-4 h-full overflow-y-auto py-2'>
						{errors?.reverse()?.map((error, idx) => (
							<div key={`${error.toString()}_${idx}`} className='text-sm flex flex-col'>
								<span className='text-xs text-black/50'>{`${new Date().toLocaleTimeString()}`}</span>
								<span>{`${error.toString()}`}</span>
							</div>
						)) ?? <div className='text-sm text-black/50'>No record found</div>}
					</div>
				</div>
			</div>
		</div>
	);
};

export default React.memo(RunPanel);
