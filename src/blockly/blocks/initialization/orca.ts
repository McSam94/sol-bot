import Blockly from 'blockly';

Blockly.Blocks.orca = {
	init() {
		this.jsonInit(this.definition());

		this.setMovable(false);
		this.setDeletable(false);
	},
	definition() {
		return {
			message0: 'Orca',
			colour: '#4E6882',
			previousStatement: null,
			nextStatement: null,
		};
	},
};

Blockly.JavaScript.orca = () => '';
