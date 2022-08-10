import Blockly from 'blockly';

Blockly.Blocks.slippage = {
	init() {
		this.jsonInit(this.definition());

		this.setMovable(false);
		this.setDeletable(false);
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
			colour: '#4E6882',
			previousStatement: null,
			extensions: ['is-in-initialization'],
		};
	},
};

Blockly.JavaScript.slippage = () => '';
