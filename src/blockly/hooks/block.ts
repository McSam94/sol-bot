//@ts-nocheck
import Blockly from 'blockly';

Blockly.Block.prototype.getSiblings = function () {
	const siblings = [this];
	['getPreviousBlock', 'getNextBlock'].forEach(functionName => {
		let block = this[functionName]();
		while (block !== null) {
			const parent = this.getParent();
			if (parent && parent.id === block.id) {
				break;
			}

			siblings.push(block);
			block = block[functionName]();
		}
	});
	return siblings;
};

Blockly.Block.prototype.getBlocksInStatement = function (statementInputName: string) {
	const blocksInStatement: Array<Blockly.Block> = [];
	const firstBlock = this.getInputTargetBlock(statementInputName);

	if (firstBlock) {
		return firstBlock.getSiblings();
	}
	return blocksInStatement;
};
