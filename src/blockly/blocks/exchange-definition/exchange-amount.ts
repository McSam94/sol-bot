import Blockly from 'blockly';

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
			previousStatement: null,
		};
	},
};

Blockly.JavaScript.exchange_amount = () => '';
