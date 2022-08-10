import Blockly from 'blockly';

Blockly.Blocks.exchange_again = {
	init() {
		this.jsonInit(this.definition());
	},
	definition() {
		return {
			message0: 'Restart',
			previousStatement: null,
			nextStatement: null,
			colour: '#4E6882',
			extensions: ['is-in-loop-condition'],
		};
	},
};

Blockly.JavaScript.exchange_again = () => `
	return true && !shouldStopFromOutside;
`;
