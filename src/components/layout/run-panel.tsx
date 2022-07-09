import * as React from 'react';
import dynamic from 'next/dynamic';
import { toast } from 'react-toastify';
import startCase from 'lodash.startcase';
import { useWallet } from '@solana/wallet-adapter-react';
import { useJupStore } from '@stores/jupiter';
import { useBotStore } from '@stores/bot';
import { useBlockly } from '@contexts/blockly';
import { WALLET_CANT_SKIP_APPROVAL } from '@constants/wallet';
import { Modal } from '@components/common';
import Button from '@components/common/button';
import ReactTooltip from 'react-tooltip';
import Icon from '@components/common/Icon';

const RunPanel: React.FC = () => {
	const { connected, wallet } = useWallet();
	const { txids, errors, clearErrors, clearTransaction } = useJupStore();
	const { botStatus, invalidBlocks, missingMandatoryBlocks, extraBlocks } = useBotStore();
	const { isWorkspaceReady, runBot, stopBot, saveWorkspace, loadWorkspace } = useBlockly();

	const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);

	const uploadRef = React.useRef<HTMLInputElement | null>(null);

	const shouldWarn = React.useMemo(
		() => WALLET_CANT_SKIP_APPROVAL.includes(wallet?.adapter.name ?? ''),
		[wallet?.adapter]
	);

	const shouldDisableRun = React.useMemo(
		() =>
			!connected ||
			botStatus === 'stopping' ||
			!isWorkspaceReady ||
			[invalidBlocks, missingMandatoryBlocks, extraBlocks].some(blocks => blocks.length > 0),
		[connected, botStatus, isWorkspaceReady, invalidBlocks, missingMandatoryBlocks, extraBlocks]
	);

	const buttonIcon = React.useMemo(() => {
		if (botStatus === 'running') return 'stop';

		return 'play';
	}, [botStatus]);

	const runTooltip = React.useMemo(() => {
		if (!connected) return 'Wallet not connected.';

		if (invalidBlocks.length > 0) return 'Workspace is not valid';

		if (missingMandatoryBlocks.length > 0)
			return `${missingMandatoryBlocks.map(startCase).join(', ')} block(s) is missing to execute the bot`;

		if (extraBlocks.length > 0) return `${extraBlocks.map(startCase).join(', ')} block must be unique`;

		return 'Run the bot';
	}, [connected, invalidBlocks, missingMandatoryBlocks, extraBlocks]);

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

	React.useEffect(() => {
		ReactTooltip.rebuild();
	});

	return (
		<>
			<div className='flex flex-col w-full h-full bg-gray-100'>
				<div className='flex flex-col h-60 justify-center border-b'>
					<div className='text-md font-bold text-center mb-2'>{`Status: ${startCase(botStatus)}`}</div>
					<div className='flex flex-row space-x-4 items-center justify-center'>
						<Button
							disabled={shouldDisableRun}
							onClick={onRunClick}
							className='shadow-lg hover:shadow-none'
						>
							<span data-tip={runTooltip} data-for='tooltip_main' data-tip-disable={false}>
								<Icon name={buttonIcon} color='white' />
							</span>
						</Button>

						<Button
							className='shadow-lg hover:shadow-none'
							disabled={!isWorkspaceReady}
							onClick={saveWorkspace}
						>
							<span data-tip='Save this workspace' data-for='tooltip_main'>
								<Icon name='save' color='white' />
							</span>
						</Button>

						<input
							ref={uploadRef}
							type='file'
							accept='.xml'
							className='w-40 hidden'
							onChange={loadWorkspace}
						></input>
						<Button
							className='shadow-lg hover:shadow-none'
							disabled={!isWorkspaceReady}
							onClick={() => uploadRef.current?.click?.()}
						>
							<span data-tip='Upload saved workspace' data-for='tooltip_main'>
								<Icon name='upload' color='white' />
							</span>
						</Button>
					</div>
				</div>
				<div className='flex flex-col px-4 py-2' style={{ height: 'calc(100% - 240px)' }}>
					<div className='flex flex-col h-1/2 border-b'>
						<div className='flex flex-row items-center w-full justify-between'>
							<div className='text-lg font-bold'>Transactions</div>
							<Icon
								name='clear'
								data-tip='Clear log'
								data-for='tooltip_main'
								className='cursor-pointer'
								colorFn={({ hover }) => (hover ? 'black' : 'gray')}
								onClick={clearTransaction}
							/>
						</div>
						<div className='flex flex-col space-y-4 h-full overflow-y-auto py-2'>
							{txids?.length ?? 0 > 0 ? (
								txids?.map(({ dateTime, txid }) => (
									<div key={txid} className='text-sm flex flex-col'>
										<span className='text-xs text-black/50'>{dateTime}</span>
										<a
											className='underline'
											href={`https://solscan.io/tx/${txid}`}
											target='_blank'
											rel='noreferrer'
										>
											Solscan
										</a>
									</div>
								))
							) : (
								<div className='text-sm text-black/50'>No record found</div>
							)}
						</div>
					</div>
					<div className='flex flex-col h-1/2'>
						<div className='flex flex-row items-center justify-between w-full'>
							<div className='text-lg font-bold'>Errors</div>
							<Icon
								name='clear'
								data-tip='Clear log'
								data-for='tooltip_main'
								className='cursor-pointer'
								colorFn={({ hover }) => (hover ? 'black' : 'gray')}
								onClick={clearErrors}
							/>
						</div>
						<div className='flex flex-col space-y-4 h-full overflow-y-auto py-2'>
							{errors?.length ?? 0 > 0 ? (
								errors?.map(({ dateTime, message, txid }) => (
									<div key={dateTime} className='text-sm flex flex-col'>
										<span className='text-xs text-black/50'>{dateTime}</span>
										<span
											className='break-all text-ellipsis overflow-hidden ...'
											data-tip={message}
											data-for='tooltip_main'
										>{`${message}`}</span>
										{txid ? (
											<a
												className='underline'
												href={`https://solscan.io/tx/${txid}`}
												target='_blank'
												rel='noreferrer'
											>
												Solscan
											</a>
										) : null}
									</div>
								))
							) : (
								<div className='text-sm text-black/50'>No record found</div>
							)}
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
