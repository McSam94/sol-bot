import Blockly from 'blockly';

Blockly.Blocks.exchange_again = {
	init() {
		this.jsonInit(this.definition());
	},
	definition() {
		return {
			message0: 'Restart',
			previousStatement: null,
			colour: '#4E6882',
			extensions: ['loop_condition_check'],
		};
	},
};

Blockly.JavaScript.exchange_again = () => `
	return true && !shouldStopFromOutside;
`;
