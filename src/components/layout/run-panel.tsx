import * as React from 'react';
import { toast } from 'react-toastify';
import { useWallet } from '@solana/wallet-adapter-react';
import { useJupStore } from '@stores/jupiter';
import { useBotStore } from '@stores/bot';
import { useBlockly } from '@contexts/blockly';
import { WALLET_CANT_SKIP_APPROVAL } from '@constants/wallet';
import { Modal } from '@components/common';
import Button from '@components/common/button';

const RunPanel: React.FC = () => {
	const { connected, wallet } = useWallet();
	const { txids, errors } = useJupStore();
	const { botStatus, invalidBlocks } = useBotStore();
	const { isWorkspaceReady, runBot, stopBot, saveWorkspace, loadWorkspace } = useBlockly();

	const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);

	const uploadRef = React.useRef<HTMLInputElement | null>(null);

	const shouldWarn = React.useMemo(
		() => WALLET_CANT_SKIP_APPROVAL.includes(wallet?.adapter.name ?? ''),
		[wallet?.adapter]
	);

	const shouldDisableRun = React.useMemo(
		() => !connected || botStatus === 'stopping' || !isWorkspaceReady || invalidBlocks.length > 0,
		[connected, botStatus, isWorkspaceReady, invalidBlocks]
	);

	const onRunClick = React.useCallback(() => {
		if (botStatus === 'stopping') return;
		if (botStatus === 'running') {
			stopBot();
			return;
		}

		if (invalidBlocks.length) {
			toast.error('Ops! Block(s) were not placed in correct order');
			return;
		}

		// idle
		if (shouldWarn) {
			setIsModalOpen(true);
			return;
		}

		runBot();
	}, [botStatus, shouldWarn, stopBot, invalidBlocks, runBot]);

	const onContinueToRun = React.useCallback(() => {
		runBot();
		setIsModalOpen(false);
	}, [runBot]);

	return (
		<>
			<div className='flex flex-col w-full h-full bg-gray-100'>
				<div className='flex flex-col border-b h-60 items-center justify-center'>
					<div className='text-md font-semibold text-center mb-2'>{`Status: ${botStatus}`}</div>
					<Button disabled={shouldDisableRun} onClick={onRunClick}>
						{botStatus === 'running' ? 'Stop' : 'Run'}
					</Button>

					<Button disabled={!isWorkspaceReady} onClick={saveWorkspace}>
						Save
					</Button>

					<input
						ref={uploadRef}
						type='file'
						accept='.xml'
						className='w-40 hidden'
						onChange={loadWorkspace}
					></input>
					<Button disabled={!isWorkspaceReady} onClick={() => uploadRef.current?.click?.()}>
						Load
					</Button>
				</div>
				<div className='flex flex-col px-4 py-2' style={{ height: 'calc(100% - 240px)' }}>
					<div className='flex flex-col h-1/2 border-b'>
						<div className='text-lg font-bold'>Transactions</div>
						<div className='flex flex-col space-y-4 h-full overflow-y-auto py-2'>
							{txids?.reverse()?.map(({ dateTime, txid }) => (
								<div key={txid} className='text-sm flex flex-col'>
									<span className='text-xs text-black/50'>{dateTime}</span>
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
						<div className='text-lg font-bold'>Errors</div>
						<div className='flex flex-col space-y-4 h-full overflow-y-auto py-2'>
							{errors?.reverse()?.map(({ dateTime, error }) => (
								<div key={dateTime} className='text-sm flex flex-col'>
									<span className='text-xs text-black/50'>{`${new Date().toLocaleTimeString()}`}</span>
									<span
										className='break-all text-ellipsis overflow-hidden ...'
										data-tip={error.toString()}
									>{`${error.toString()}`}</span>
								</div>
							)) ?? <div className='text-sm text-black/50'>No record found</div>}
						</div>
					</div>
				</div>
			</div>
			<Modal
				isOpen={isModalOpen}
				onRequestClose={() => setIsModalOpen(false)}
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
					<button className='bg-black text-white rounded-lg w-40 py-2 mx-auto' onClick={onContinueToRun}>
						Continue to run
					</button>
				</div>
			</Modal>
		</>
	);
};

export default React.memo(RunPanel);