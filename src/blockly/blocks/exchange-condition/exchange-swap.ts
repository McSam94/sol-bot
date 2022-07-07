import Blockly from 'blockly';

Blockly.Blocks.exchange_swap = {
	init() {
		this.jsonInit(this.definition());
	},
	definition() {
		return {
			message0: 'Execute Swap',
			previousStatement: null,
			extensions: ['exchange_condition_check'],
		};
	},
};

Blockly.JavaScript.exchange_swap = () => `executeSwap(wallet);`;
