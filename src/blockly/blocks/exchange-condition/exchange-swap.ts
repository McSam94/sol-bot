import Blockly from 'blockly';

Blockly.Blocks.exchange_swap = {
	init() {
		this.jsonInit(this.definition());
	},
	definition() {
		return {
			message0: 'Execute Swap',
			previousStatement: null,
			colour: '#4E6882',
			extensions: ['exchange_condition_check'],
		};
	},
};

Blockly.JavaScript.exchange_swap = () => `executeSwap(wallet);`;
