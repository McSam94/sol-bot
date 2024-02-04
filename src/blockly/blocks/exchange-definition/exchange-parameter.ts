import Blockly from 'blockly';
import JupStore from '@stores/jupiter';

Blockly.Blocks.exchange_parameter = {
	init() {
		this.jsonInit(this.definition());

		this.setMovable(false);
		this.setDeletable(false);

		/** Update receive dropdown based on PAY_TOKEN_LIST value */
		const payToken = this.getFieldValue('PAY_TOKEN_LIST');
		const receiveDropdown = this.getField('RECEIVE_TOKEN_LIST');
	},
	definition() {
		const _this = this;
		return {
			message0: 'You pay: %1, You receive: %2',
			args0: [
				{
					type: 'custom_dropdown',
					name: 'PAY_TOKEN_LIST',
					options: JupStore.getState().getTokensDropdown() ?? [],
				},
				{
					type: 'custom_dropdown',
					name: 'RECEIVE_TOKEN_LIST',
					options: JupStore.getState().getTokensDropdown() ?? [],
				},
			],
			colour: '#4E6882',
			previousStatement: null,
			nextStatement: null,
			extensions: ['exchange_definition_check'],
		};
	},
};

Blockly.JavaScript.exchange_parameter = () => '';
