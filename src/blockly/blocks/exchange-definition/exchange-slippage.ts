import Blockly from 'blockly';

Blockly.Blocks.exchange_slippage = {
	init() {
		this.jsonInit(this.definition());
	},
	definition() {
		return {
			message0: 'Allowed slippage %1 %',
			args0: [
				{
					type: 'input_value',
					name: 'SLIPPAGE',
					check: 'Number',
				},
			],
			previousStatement: null,
		};
	},
};

Blockly.JavaScript.exchange_slippage = () => '';
