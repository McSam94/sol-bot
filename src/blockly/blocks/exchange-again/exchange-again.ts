import Blockly from 'blockly';

Blockly.Blocks.exchange_again = {
	init() {
		this.jsonInit(this.definition());
	},
	definition() {
		return {
			message0: 'Restart',
			previousStatement: null,
		};
	},
};

Blockly.JavaScript.exchange_again = () => `
	return true && !shouldStopFromOutside;
`;
