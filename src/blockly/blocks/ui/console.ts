import Blockly, { BlockSvg } from 'blockly';

Blockly.Blocks.console = {
	init() {
		this.jsonInit(this.definition());
	},
	definition() {
		return {
			message0: 'show time %1',
			message1: 'console %1',
			args0: [
				{
					type: 'field_checkbox',
					name: 'CONSOLE_TIME',
					checked: true,
				},
			],
			args1: [
				{
					type: 'input_value',
					name: 'TEXT',
				},
			],
			colour: 215,
			tooltip: 'Open DevTool (F12) > Console to see the log',
			previousStatement: null,
			nextStatement: null,
		};
	},
};

Blockly.JavaScript.console = (block: BlockSvg) => {
	const msg = Blockly.JavaScript.valueToCode(block, 'TEXT', Blockly.JavaScript.ORDER_NONE) || "''";
	const shouldShowTime = block.getFieldValue('CONSOLE_TIME') === 'TRUE';

	return `console.log(${`${shouldShowTime ? `new Date().toLocaleString(), '→',` : ''}`}${msg});\n`;
};
