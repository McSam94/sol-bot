import { TOOLBOX } from '@constants/blockly';
import { Block, BlockSvg } from 'blockly';

export const getChildByType = (block: BlockSvg, type: string) =>
	block.getDescendants(true).find(child => child.type === type);

export const getInputValue = (block: BlockSvg | Block | undefined) =>
	block?.getChildren(true)?.[0]?.inputList[0]?.fieldRow?.[0]?.getValue();

export const generateCode = (code: string) => {
	return `
		var shouldLoop = true;

		${code}\n

		while(shouldLoop) {
			JupDefinition();
			JupExchange();
			shouldLoop = JupLoop();
		}

		idleBot()
	`;
};
