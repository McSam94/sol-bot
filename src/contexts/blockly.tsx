import * as React from 'react';
import { SignerWalletAdapter } from '@solana/wallet-adapter-base';
import { useWallet } from '@solana/wallet-adapter-react';
import Blockly, { WorkspaceSvg } from 'blockly';
import { useInterval } from 'react-use';
import { Interpreter } from 'js-interpreter-npm';
import { interpreterConfig } from '@utils/interpreter';
import { fetchXml, saveAs, generateCode } from '@utils/blockly';
import WalletStore, { useWalletStore } from '@stores/wallet';
import { useJupStore } from '@stores/jupiter';

import '@blockly/blocks';
import '@blockly/fields';
import '@blockly/extensions';
import '@blockly/styles';
import { useBotStore } from '@stores/bot';

interface BlocklyContextProps {
	workspace: Blockly.WorkspaceSvg | undefined;
	runBot: () => void;
	stopBot: () => void;
	saveWorkspace: () => void;
	loadWorkspace: (event: any) => void;
}

const BlocklyContext = React.createContext<BlocklyContextProps>({
	workspace: undefined,
	runBot: () => {},
	stopBot: () => {},
	saveWorkspace: () => {},
	loadWorkspace: () => {},
});

const BLOCKLY_WORKSPACE_CONFIG = {
	grid: { spacing: 40, length: 11, colour: '#f3f3f3' },
	trashcan: true,
	scrollbars: true,
};

const BlocklyProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
	const { wallet, publicKey } = useWallet();
	const { init: jupInit, setWallet: setJupWallet, jupiter } = useJupStore();
	const { setState } = useBotStore();
	const { init: walletInit, setWallet } = useWalletStore();

	const [workspace, setWorkspace] = React.useState<WorkspaceSvg>();

	const workspaceElementID = React.useRef<string>('blocklyDiv');

	const renderWorkspace = React.useCallback(
		async (opts = BLOCKLY_WORKSPACE_CONFIG) => {
			await jupInit();
			await walletInit();
			const toolboxXml = await fetchXml('/xml/toolbox.xml');
			const defaultXml = (await fetchXml('/xml/default.xml')) as string;
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
		[jupInit, walletInit]
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

		saveAs({ data: savedData, filename: 'Unsaved_workspace', opts: { type: 'text/xml;charset=utf-8' } });
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

	useInterval(() => {
		if (!publicKey) return;

		WalletStore.getState().getUserBalances(publicKey);
	}, 10000);

	// set wallet to store
	React.useEffect(() => {
		if (!jupiter || !wallet?.adapter || !setJupWallet) return;

		setJupWallet(wallet.adapter as SignerWalletAdapter);
		setWallet(wallet.adapter as SignerWalletAdapter);
	}, [jupiter, wallet?.adapter, setJupWallet, setWallet]);

	React.useEffect(() => {
		renderWorkspace();
	}, [renderWorkspace]);

	return (
		<BlocklyContext.Provider value={{ workspace, runBot, stopBot, saveWorkspace, loadWorkspace }}>
			{children}
		</BlocklyContext.Provider>
	);
};

export default BlocklyProvider;
export const useBlockly = () => {
	return React.useContext(BlocklyContext);
};
