import Blockly, { BlockSvg } from 'blockly';
import { ExchangeAgain } from '../images';

Blockly.Blocks.loop_condition = {
	init() {
		this.jsonInit(this.definition());
	},
	definition() {
		return {
			message0: '%1 %2 %3',
			message1: '%1',
			args0: [
				{
					type: 'field_image',
					src: ExchangeAgain,
					width: 25,
					height: 25,
					alt: 'exchange',
				},
				{
					type: 'field_label',
					text: '3. Restart conditions',
				},
				{
					type: 'dummy_field',
					width: '20',
				},
			],
			args1: [
				{
					type: 'input_statement',
					name: 'LOOP_CONDITION',
				},
			],
			colour: '#020029',
		};
	},
};

Blockly.JavaScript.loop_condition = (block: BlockSvg) => {
	const stack = Blockly.JavaScript.statementToCode(block, 'LOOP_CONDITION');

	return `
		function JupLoop() {
			var shouldStopFromOutside = shouldBotStop();

			${stack}
			return false;
		}
	`;
};
