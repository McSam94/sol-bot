import { TOOLBOX } from '@constants/blockly';
import Blockly, { Block, BlockSvg } from 'blockly';

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

		${code}\n

		while(shouldLoop) {
			JupDefinition();
			JupExchange();
			shouldLoop = JupLoop();
		}

		idleBot();
	`;
};
