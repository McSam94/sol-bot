import Blockly from 'blockly';

Blockly.Blocks.exchange_swap = {
	init() {
		this.jsonInit(this.definition());
	},
	definition() {
		return {
			message0: 'Execute Swap',
			previousStatement: null,
		};
	},
};

Blockly.JavaScript.exchange_swap = () => `executeSwap();`;
