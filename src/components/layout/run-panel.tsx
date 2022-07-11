import * as React from 'react';
import Link from 'next/link';
import RelativeTime from '@yaireo/relative-time';
import startCase from 'lodash.startcase';
import ReactTooltip from 'react-tooltip';
import toast from 'react-hot-toast';
import { FixedSizeList as List } from 'react-window';
import { useWallet } from '@solana/wallet-adapter-react';
import Image from 'next/image';
import { useJupStore } from '@stores/jupiter';
import TokenInfo from '@components/common/tokenIcon';
import { useBotStore } from '@stores/bot';
import { useBlockly } from '@contexts/blockly';
import { WALLET_CANT_SKIP_APPROVAL } from '@constants/wallet';
import useWindow from '@hooks/useWindow';
import { Modal } from '@components/common';
import Button from '@components/common/button';
import Icon from '@components/common/Icon';
import { useInterval } from 'react-use';

const RunPanel: React.FC = () => {
	const clientWindow = useWindow();
	const { connected, wallet } = useWallet();
	const { transactions, errors, clearErrors, clearTransaction, setState } = useJupStore();
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

	const { listWidth, listHeight } = React.useMemo(() => {
		const panelWidth = 320;
		const paddingX = 32;

		const headerHeight = 80;
		const panelHeight = (clientWindow?.innerHeight ?? 0) - headerHeight;
		const panelHeader = 240;
		const panelContentPaddingY = 8 * 2;
		const panelTitle = 28 * 2;

		return {
			listWidth: panelWidth - paddingX,
			listHeight: (panelHeight - panelHeader - panelContentPaddingY - panelTitle) / 2,
		};
	}, [clientWindow]);

	const transactionRowRenderer = React.useCallback(
		({ index, style }: { index: number; style: React.CSSProperties }) => {
			const transaction = transactions?.[index];

			if (!transaction) return null;

			const {
				param: { inputToken, outputToken, inAmount, outAmount },
				txid,
				dateTime,
			} = transaction;

			return (
				<div key={txid} className='flex flex-row justify-between py-4 border-b' style={style}>
					<div className='flex flex-col justify-between h-full'>
						<div className='flex flex-row items-center space-x-4'>
							<TokenInfo logoURI={inputToken?.logoURI} size={20} />
							<div className='text-xs text-black/75'>
								{`${inAmount} ${inputToken?.symbol}` ?? 'Unknown'}
							</div>
						</div>
						<div className='flex justify-center'>
							<Icon name='exchange' size={10} />
						</div>
						<div className='flex flex-row items-center space-x-4'>
							<TokenInfo logoURI={transaction?.param.outputToken?.logoURI} size={20} />
							<div className='text-xs text-black/75'>
								{`${outAmount} ${outputToken?.symbol}` ?? 'Unknown'}
							</div>
						</div>
					</div>
					<div className='text-sm flex flex-col justify-between items-end h-full'>
						<Link className='underline' href={`https://solscan.io/tx/${txid}`} rel='noreferrer' passHref>
							<a
								target='_blank'
								className='flex flex-row items-center border border-gray-300 hover:border-gray-500 rounded p-1'
							>
								<Image src='/icons/solscan.svg' width={60} height={8} alt='solscan' />
								<Icon name='more' size={10} color='gray' />
							</a>
						</Link>
						<span
							className='text-xs text-black/50 cursor-pointer'
							data-tip={dateTime.toString()}
							data-for='tooltip_main'
						>
							{new RelativeTime().from(dateTime)}
						</span>
					</div>
				</div>
			);
		},
		[transactions]
	);

	const errorsRowRenderer = React.useCallback(
		({ index, style }: { index: number; style: React.CSSProperties }) => {
			const error = errors?.[index];

			if (!error) return null;

			const { dateTime, message, txid } = error;

			return (
				<div
					key={dateTime.getTime()}
					className='text-sm flex flex-col justify-between py-4 border-b'
					style={style}
				>
					<span
						className='break-all text-ellipsis overflow-hidden ...'
						data-tip={message}
						data-for='tooltip_main'
					>{`${message}`}</span>
					<div className='flex flex-row items-center justify-between'>
						{txid ? (
							<Link
								className='underline'
								href={`https://solscan.io/tx/${txid}`}
								rel='noreferrer'
								passHref
							>
								<a
									target='_blank'
									className='flex flex-row items-center border border-gray-300 hover:shadow-lg rounded p-1'
								>
									<Image src='/icons/solscan.svg' width={60} height={8} alt='solscan' />
									<Icon name='more' size={10} color='gray' />
								</a>
							</Link>
						) : null}
						<span
							className='text-xs text-black/50 cursor-pointer'
							data-tip={dateTime.toString()}
							data-for='tooltip_main'
						>
							{new RelativeTime().from(dateTime)}
						</span>
					</div>
				</div>
			);
		},
		[errors]
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

	// real time relative time
	useInterval(
		() => setState({ transactions: [...(transactions ?? [])] }),
		transactions?.length ?? 0 > 0 ? 5000 : null
	);
	useInterval(() => setState({ errors: [...(errors ?? [])] }), errors?.length ?? 0 > 0 ? 5000 : null);

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

						{transactions?.length ?? 0 > 0 ? (
							<List
								width={listWidth}
								height={listHeight}
								itemCount={transactions?.length ?? 0}
								itemSize={100}
							>
								{transactionRowRenderer}
							</List>
						) : (
							<div className='flex flex-col space-y-4 items-center justify-center h-full'>
								<Icon name='empty' size={50} color='lightgray' />
								<div className='text-sm text-black/50'>No record found</div>
							</div>
						)}
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
								<List
									width={listWidth}
									height={listHeight}
									itemCount={errors?.length ?? 0}
									itemSize={100}
								>
									{errorsRowRenderer}
								</List>
							) : (
								<div className='flex flex-col space-y-4 items-center justify-center h-full'>
									<Icon name='empty' size={50} color='lightgray' />
									<div className='text-sm text-black/50'>No record found</div>
								</div>
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
