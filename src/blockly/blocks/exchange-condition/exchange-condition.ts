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
					width: 25,
					height: 25,
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
			colour: '#020029',
		};
	},
};

Blockly.JavaScript.exchange_condition = (block: BlockSvg) => {
	const stack = Blockly.JavaScript.statementToCode(block, 'EXCHANGE_CONDITION');

	return `
		var computedRoutes;

		function JupExchange() {
			computedRoutes = computeRoutes();

			console.log(Number(getBestRouteProp('outAmountWithSlippage')))

			${stack}
		}
	`;
};
