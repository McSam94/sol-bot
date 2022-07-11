import Blockly, { BlockSvg } from 'blockly';
import { getInputValue } from '@utils/blockly';

Blockly.Blocks.exchange_amount = {
	init() {
		this.jsonInit(this.definition());
	},
	definition() {
		return {
			message0: 'Amount: %1',
			args0: [
				{
					type: 'input_value',
					name: 'EXCHANGE_AMOUNT',
					check: 'Number',
				},
			],
			colour: '#4E6882',
			previousStatement: null,
			extensions: ['exchange_definition_check'],
		};
	},
};

Blockly.JavaScript.exchange_amount = (block: BlockSvg) => {
	const value = getInputValue(block, 'EXCHANGE_AMOUNT');

	return `
		amount = ${value};

		updateJupParam('amount', amount);
	`;
};
