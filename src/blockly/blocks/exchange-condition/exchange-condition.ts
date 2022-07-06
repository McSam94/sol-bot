import Blockly, { BlockSvg } from 'blockly';
import { ExchangeCondition } from '../images';

Blockly.Blocks.exchange_condition = {
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
					src: ExchangeCondition,
					width: 15,
					height: 15,
					alt: 'Exchange',
				},
				{
					type: 'field_label',
					text: '2. Exchange condition',
				},
				{
					type: 'dummy_field',
					width: '20',
				},
			],
			args1: [
				{
					type: 'input_statement',
					name: 'EXCHANGE_CONDITION',
				},
			],
		};
	},
};

Blockly.JavaScript.exchange_condition = (block: BlockSvg) => {
	const stack = Blockly.JavaScript.statementToCode(block, 'EXCHANGE_CONDITION');

	return `
		var computedRoutes;

		function JupExchange() {
			toast('Checking Exchange Conditions...');

			computedRoutes = computeRoutes();

			${stack}
		}
	`;
};
