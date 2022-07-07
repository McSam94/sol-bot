import Blockly, { Block, BlockSvg } from 'blockly';
import filesaver from 'file-saver';

export const xmlToStr = (xml: Node) => {
	const serializer = new XMLSerializer();
	return serializer.serializeToString(xml);
};

export const fetchXml = (filePath: string) => {
	return new Promise(resolve => {
		const xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
				resolve(this.responseText);
			}
		};
		xhttp.open('GET', filePath, true);
		xhttp.send();
	});
};

export const getChildByType = (block: BlockSvg, type: string) =>
	block.getDescendants(true).find(child => child.type === type);

export const getInputValue = (block: BlockSvg | Block | undefined, fieldName: string) => {
	const inputBlock = block?.getInputTargetBlock(fieldName);
	const isVariable = inputBlock?.type === 'variables_get';

	const value = Blockly.JavaScript.valueToCode(block, fieldName, Blockly.JavaScript.ORDER_ATOMIC);

	return isVariable ? value : `'${value}'`;
};

export const generateCode = (code: string) => {
	return `
		var shouldLoop = true;

		// Define wallet
		var wallet = getWallet();

		${code}\n

		while(shouldLoop) {
			try {
				if (!JupDefinition) toast.error('Exchange Parameter block is mandatory to be in the workspace');
				JupDefinition();

				if (JupExchange) {
					JupExchange();
				}

				if (JupLoop) {
					shouldLoop = JupLoop();
				}
			} catch (error) {
				toast.error(error)
				shouldLoop = false
			}
		}

		idleBot();
	`;
};

export const saveAs = ({ data, filename, opts }: { data: string; filename: string; opts: BlobPropertyBag }) => {
	const blob = new Blob([data], opts);
	filesaver.saveAs(blob, filename);
};
