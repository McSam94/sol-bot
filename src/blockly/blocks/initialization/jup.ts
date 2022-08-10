import Blockly from 'blockly';
import JupStore from '@stores/jupiter';
import { Jupiter } from '../images';

Blockly.Blocks.jup = {
	init() {
		this.jsonInit(this.definition());

		this.setMovable(false);
		this.setDeletable(false);

		/** Update receive dropdown based on PAY_TOKEN_LIST value */
		const payToken = this.getFieldValue('PAY_TOKEN_LIST');
		const receiveDropdown = this.getField('RECEIVE_TOKEN_LIST');
		const receiveDropdownOptions = JupStore.getState()?.getAvailablePairedTokenDropdown(payToken);
		if (!receiveDropdownOptions) return;

		receiveDropdown.updateMenu(receiveDropdownOptions);
		receiveDropdown.setValue(receiveDropdownOptions?.[0].value);
	},
	definition() {
		const _this = this;
		return {
			message0: '%1 %2',
			message1: 'You pay: %1, You receive: %2',
			args0: [
				{
					type: 'field_image',
					src: Jupiter,
					width: 25,
					height: 25,
					alt: 'Exchange',
				},
				{
					type: 'field_label',
					text: 'Jupiter Parameter',
				},
			],
			args1: [
				{
					type: 'custom_dropdown',
					name: 'PAY_TOKEN_LIST',
					options: JupStore.getState().getTokensDropdown() ?? [],
				},
				{
					type: 'custom_dropdown',
					name: 'RECEIVE_TOKEN_LIST',
					options: () =>
						JupStore.getState()?.getAvailablePairedTokenDropdown(_this.getFieldValue('PAY_TOKEN_LIST')) ??
						[],
				},
			],
			colour: '#4E6882',
			previousStatement: null,
			nextStatement: null,
			extensions: ['is-in-initialization'],
		};
	},
};

Blockly.JavaScript.jup = () => '';
