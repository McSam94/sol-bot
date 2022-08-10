import Blockly, { BlockSvg } from 'blockly';
import { Initialization } from '../images';

Blockly.Blocks.initialization = {
	init() {
		this.jsonInit(this.definition());

		this.setOnChange((event: any) => {
			if (event.name === 'TRADING_PROTOCOL') {
				const hasDivisorInput = this.getFieldValue('TRADING_PROTOCOL');
				this.updateShape(hasDivisorInput?.split(',') ?? []);
			}
		});
	},
	definition() {
		return {
			message0: '%1 %2 %3',
			message1: '%1',
			message2: '%1 %2 %3',
			message3: '%1',
			message4: '%1 %2 %3',
			message5: '%1',
			args0: [
				{
					type: 'field_image',
					src: Initialization,
					width: 25,
					height: 25,
					alt: 'Exchange',
				},
				{
					type: 'field_label',
					text: '1. Initialization',
				},
				{
					type: 'dummy_field',
					width: 20,
				},
			],
			args1: [
				{
					type: 'input_statement',
					name: 'INITIALIZATION_PARAMETER',
				},
			],
			args2: [
				{
					type: 'dummy_field',
					width: 15,
				},
				{
					type: 'field_label',
					text: 'Run once at start:',
					class: 'text-sm',
				},
				{
					type: 'dummy_field',
				},
			],
			args3: [
				{
					type: 'input_statement',
					name: 'RUN_ONCE',
				},
			],
			args4: [
				{
					type: 'dummy_field',
					width: 15,
				},
				{
					type: 'field_label',
					text: 'Exchange amount:',
				},
				{
					type: 'dummy_field',
				},
			],
			args5: [
				{
					type: 'input_statement',
					name: 'TRADE_AMOUNT',
				},
			],
			colour: '#020029',
			extensions: ['has-amount-block'],
		};
	},
	domToMutation(xmlElement: HTMLElement) {
		const tradingProtocols = xmlElement.getAttribute('trading_protocol');
		this.updateShape(tradingProtocols?.split(',') ?? []);
	},
	mutationToDom() {
		const container = document.createElement('mutation');
		const tradingProtocol = this.getFieldValue('TRADING_PROTOCOL');
		container.setAttribute('trading_protocol', tradingProtocol?.join(',') ?? '');
		return container;
	},
	updateShape(tradingProtocols: Array<string>) {
		const paramBlocks = this.getBlocksInStatement('INITIALIZATION_PARAMETER');
		const paramInput = this.getInput('INITIALIZATION_PARAMETER');

		paramBlocks.forEach((block: Blockly.Block) => {
			if (block.type === 'slippage' || tradingProtocols.includes(block.type)) {
				this.setEnabled(true);
			} else {
				this.setEnabled(false);
			}
		});
	},
};

Blockly.JavaScript.initialization = (block: BlockSvg) => {};
