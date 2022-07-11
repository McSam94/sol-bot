import Blockly, { BlockSvg } from 'blockly';

Blockly.Blocks.exchange_result = {
	init() {
		this.jsonInit(this.definition());
	},
	definition() {
		return {
			message0: 'Swap result %1',
			args0: [
				{
					type: 'field_dropdown',
					name: 'SWAP_RESULT',
					options: [
						['Failed', 'failed'],
						['Success', 'success'],
					],
				},
			],
			colour: '#4E6882',
			output: null,
		};
	},
};

Blockly.JavaScript.exchange_result = (block: BlockSvg) => {
	const result = block.getFieldValue('SWAP_RESULT');

	return [`Boolean(getSwapResult('${result}'))`, Blockly.JavaScript.ORDER_ATOMIC];
};
