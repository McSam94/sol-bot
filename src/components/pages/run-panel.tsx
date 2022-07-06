import * as React from 'react';
import ReactModal from 'react-modal';
import { useWallet } from '@solana/wallet-adapter-react';
import { useJupStore } from '@blockly/store/jupiter';
import { useBlockly } from '@contexts/blockly';
import WalletButton from '@components/common/wallet';
import { WALLET_CANT_SKIP_APPROVAL } from '@constants/wallet';
import classNames from 'classnames';

const RunPanel: React.FC = () => {
	const { connected, wallet } = useWallet();
	const { txids, errors, botStatus } = useJupStore();
	const { runBot, stopBot, saveWorkspace, loadWorkspace } = useBlockly();

	const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);

	const uploadRef = React.useRef<HTMLInputElement | null>(null);

	const shouldWarn = React.useMemo(
		() => WALLET_CANT_SKIP_APPROVAL.includes(wallet?.adapter.name ?? ''),
		[wallet?.adapter]
	);

	const onRunClick = React.useMemo(() => {
		if (botStatus === 'running') {
			return stopBot;
		}

		if (botStatus === 'idle') {
			return shouldWarn ? () => setIsModalOpen(true) : runBot;
		}
	}, [botStatus, shouldWarn, stopBot, runBot]);

	return (
		<>
			<div className='flex flex-col w-full h-full bg-slate-200'>
				<div className='flex flex-col border-b h-60 items-center justify-center'>
					<div className='text-md font-semibold text-center mb-2'>{`Status: ${botStatus}`}</div>
					<button
						className={classNames('border bg-black text-white px-10 py-2 rounded-lg', {
							'cursor-not-allowed bg-black/50': !connected,
						})}
						disabled={!connected}
						onClick={onRunClick}
					>
						{botStatus === 'running' ? 'Stop' : 'Run'}
					</button>

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
				<div className='flex flex-col px-4 py-2' style={{ height: 'calc(100% - 240px)' }}>
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
									<span
										className='text-ellipsis overflow-hidden ...'
										data-tip={error.toString()}
									>{`${error.toString()}`}</span>
								</div>
							)) ?? <div className='text-sm text-black/50'>No record found</div>}
						</div>
					</div>
				</div>
			</div>
			<ReactModal
				shouldCloseOnEsc
				shouldCloseOnOverlayClick
				isOpen={isModalOpen}
				onRequestClose={() => setIsModalOpen(false)}
				overlayElement={(props, contentElement) => (
					<div {...props} className={`z-100 ${props.className}`}>
						{contentElement}
					</div>
				)}
				contentElement={(props, children) => (
					<div
						{...props}
						className={`z-100 w-96 h-52 !rounded-lg !inset-1/2 -translate-x-1/2 -translate-y-1/2 ${props.className}`}
					>
						{children}
					</div>
				)}
			>
				<div className='flex flex-col space-y-4'>
					<div className='text-lg font-bold text-center'>Warning</div>
					<div className='text-sm'>{`${WALLET_CANT_SKIP_APPROVAL.join(
						','
					)} wallet does not support auto-approval. You can still start the bot but you'll need to approve on every transaction.`}</div>
					<button className='bg-black text-white rounded-lg w-40 py-2 mx-auto' onClick={runBot}>
						Continue to run
					</button>
				</div>
			</ReactModal>
		</>
	);
};

export default React.memo(RunPanel);
