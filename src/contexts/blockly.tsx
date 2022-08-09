import * as React from 'react';
import { SignerWalletAdapter } from '@solana/wallet-adapter-base';
import { useWallet } from '@solana/wallet-adapter-react';
import Blockly, { WorkspaceSvg } from 'blockly';
import { useBeforeUnload } from 'react-use';
import { Interpreter } from 'js-interpreter-npm';
import { LOCAL_STORAGE, MANDATORY_BLOCKS, UNIQUE_BLOCKS } from '@constants/blockly';
import { interpreterConfig } from '@utils/interpreter';
import { fetchXml, saveAs, generateCode } from '@utils/blockly';
import { devLog } from '@utils/dev';
import { useTokenStore } from '@stores/token';
import { useJupStore } from '@stores/jupiter';
import { useBotStore } from '@stores/bot';

import '@blockly/blocks';
import '@blockly/fields';
import '@blockly/extensions';
import '@blockly/styles';

interface BlocklyContextProps {
	workspace: Blockly.WorkspaceSvg | undefined;
	isWorkspaceReady: boolean;
	runBot: () => void;
	stopBot: () => void;
	saveWorkspace: () => void;
	loadWorkspace: (event: any) => void;
}

const BlocklyContext = React.createContext<BlocklyContextProps>({
	workspace: undefined,
	isWorkspaceReady: false,
	runBot: () => {},
	stopBot: () => {},
	saveWorkspace: () => {},
	loadWorkspace: () => {},
});

const BLOCKLY_WORKSPACE_CONFIG = {
	grid: { spacing: 40, length: 11, colour: '#f3f3f3' },
	trashcan: true,
	zoom: { pinch: true, wheel: true },
	scrollbars: true,
};

const BlocklyProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
	const { wallet, publicKey } = useWallet();
	const { init: jupInit, setWallet: setJupWallet, jupiter } = useJupStore();
	const {
		setState,
		botStatus,
		removeInvalidBlock,
		addMissingBlock,
		removeMissingBlock,
		addExtraBlock,
		removeExtraBlock,
	} = useBotStore();
	const { init: tokenInit, setWallet } = useTokenStore();

	const [workspace, setWorkspace] = React.useState<WorkspaceSvg>();

	const workspaceElementID = React.useRef<string>('blocklyDiv');

	const isWorkspaceReady = React.useMemo(() => !!workspace, [workspace]);

	const initializeStore = React.useCallback(async () => {
		await jupInit();
		await tokenInit();
	}, [jupInit, tokenInit]);

	const renderWorkspace = React.useCallback(
		async (opts = BLOCKLY_WORKSPACE_CONFIG) => {
			await initializeStore();

			const toolboxXml = await fetchXml('/xml/toolbox.xml');
			const defaultXml =
				localStorage.getItem(LOCAL_STORAGE.SAVED_WORKSPACE) ?? ((await fetchXml('/xml/default.xml')) as string);
			setWorkspace(prevState => {
				if (prevState) return prevState;
				// @ts-ignored
				const injectedWorkspace = Blockly.inject(workspaceElementID.current, { ...opts, toolbox: toolboxXml });
				Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(defaultXml), injectedWorkspace);

				injectedWorkspace.addChangeListener(() => {
					return injectedWorkspace;
				});

				return injectedWorkspace;
			});
		},
		[initializeStore]
	);

	const runInterpreter = React.useCallback((interpreter: typeof Interpreter, oldResolver?: () => void) => {
		const finishInterpreter = (resolver: () => void) => {
			if (interpreter.run()) {
				setTimeout(() => finishInterpreter(resolver), 1500);
			} else {
				resolver();
			}
		};

		return new Promise<void>(resolve => {
			finishInterpreter(resolve);
		});
	}, []);

	const runBot = React.useCallback(async () => {
		setState({ botStatus: 'running' });

		const code = generateCode(Blockly.JavaScript.workspaceToCode(workspace));
		devLog('🦉 ~ code', code);
		const interpreter = new Interpreter(code, interpreterConfig);

		await runInterpreter(interpreter);
	}, [setState, workspace, runInterpreter]);

	const stopBot = React.useCallback(() => {
		setState({ botStatus: 'stopping' });
	}, [setState]);

	const saveWorkspace = React.useCallback(() => {
		if (!workspace) throw new Error('No workspace found');

		const convertedDOM = Blockly.Xml.workspaceToDom(workspace);
		const savedData = Blockly.Xml.domToPrettyText(convertedDOM);

		saveAs({ data: savedData, filename: 'untitled', opts: { type: 'text/xml;charset=utf-8' } });
	}, [workspace]);

	const loadFile = React.useCallback(
		(evt: any) => {
			if (!workspace) throw new Error('No workspace found');
			const readFile = evt.target.result;
			// Check Xml is valid
			try {
				new DOMParser().parseFromString(readFile, 'application/xml');
			} catch (error: any) {
				throw new Error(error);
			}

			const xml = Blockly.Xml.textToDom(readFile);
			workspace.clear();
			Blockly.Xml.domToWorkspace(xml, workspace);
		},
		[workspace]
	);

	const loadWorkspace = React.useCallback(
		(event: any) => {
			const {
				target: { files },
			} = event;
			const filesBytes: any[] = Array.from(files);
			const fileReader = new FileReader();

			fileReader.onload = loadFile;
			fileReader.readAsText(filesBytes[0]);
		},
		[loadFile]
	);

	useBeforeUnload(() => botStatus !== 'idle', 'Your bot is running, are you sure you wanna quit?');

	// set wallet to store
	React.useEffect(() => {
		if (!jupiter || !wallet?.adapter || !setJupWallet) return;

		setJupWallet(wallet.adapter as SignerWalletAdapter);
		setWallet(wallet.adapter as SignerWalletAdapter);
	}, [jupiter, wallet?.adapter, setJupWallet, setWallet]);

	React.useEffect(() => {
		workspace?.addChangeListener((event: Blockly.Events.BlockBase) => {
			// auto save workspace to local storage
			const workspaceDOM = Blockly.Xml.workspaceToDom(workspace);
			const workspaceXML = Blockly.Xml.domToPrettyText(workspaceDOM);
			localStorage.setItem(LOCAL_STORAGE.SAVED_WORKSPACE, workspaceXML);

			// Check if invalidate block is removed
			if (event instanceof Blockly.Events.BlockDelete) {
				event.ids?.forEach(id => removeInvalidBlock(id));
			}

			// Check if mandatory block is in workspace
			if (event instanceof Blockly.Events.BlockCreate || event instanceof Blockly.Events.BlockDelete) {
				const blocks = workspace.getAllBlocks(true);

				// Check if mandatory block is in the workspace
				MANDATORY_BLOCKS.forEach(blockType => {
					if (blocks.some(block => block.type === blockType)) {
						removeMissingBlock(blockType);
					} else {
						addMissingBlock(blockType);
					}
				});

				// Check if there's duplicate blocks
				UNIQUE_BLOCKS.forEach(blockType => {
					const extraBlockCount = blocks.filter(block => block.type === blockType).length;
					if (extraBlockCount > 1) {
						addExtraBlock(blockType);
					} else {
						removeExtraBlock(blockType);
					}
				});
			}
		});
	}, [workspace, removeInvalidBlock, addMissingBlock, removeMissingBlock, addExtraBlock, removeExtraBlock]);

	// first render workspace
	React.useEffect(() => {
		renderWorkspace();

		() => setWorkspace(undefined);
	}, [renderWorkspace]);

	React.useEffect(() => {
		if (!document && workspace) return;

		const toolboxEl = document.getElementsByClassName('blocklyToolboxDiv')[0];
		if (!toolboxEl) return;

		const imgContainer = document.createElement('div');
		imgContainer.classList.add('flex');
		imgContainer.classList.add('flex-1');
		imgContainer.classList.add('items-end');
		imgContainer.classList.add('px-2');
		const blocklyImg = document.createElement('img');
		blocklyImg.src = '/credit/blockly.svg';
		blocklyImg.width = 100;
		imgContainer.appendChild(blocklyImg);
		toolboxEl.classList.add('!flex');
		toolboxEl.classList.add('flex-col');
		toolboxEl.appendChild(imgContainer);
	}, [workspace]);

	return (
		<BlocklyContext.Provider value={{ workspace, isWorkspaceReady, runBot, stopBot, saveWorkspace, loadWorkspace }}>
			{children}
		</BlocklyContext.Provider>
	);
};

export default BlocklyProvider;
export const useBlockly = () => {
	return React.useContext(BlocklyContext);
};
