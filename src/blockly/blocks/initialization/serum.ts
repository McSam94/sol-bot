import Blockly from 'blockly';

Blockly.Blocks.serum = {
	init() {
		this.jsonInit(this.definition());

		this.setMovable(false);
		this.setDeletable(false);
	},
	definition() {
		return {
			message0: 'Serum',
			colour: '#4E6882',
			previousStatement: null,
			nextStatement: null,
		};
	},
};

Blockly.JavaScript.serum = () => '';
