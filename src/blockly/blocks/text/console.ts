import Blockly, { BlockSvg } from 'blockly';

Blockly.Blocks.console = {
	init() {
		this.jsonInit(this.definition());
	},
	definition() {
		return {
			message0: 'console %1',
			args0: [
				{
					type: 'input_value',
					name: 'TEXT',
				},
			],
			previousStatement: null,
			nextStatement: null,
		};
	},
};

Blockly.JavaScript.console = (block: BlockSvg) => {
	const msg = Blockly.JavaScript.valueToCode(block, 'TEXT', Blockly.JavaScript.ORDER_NONE) || "''";
	const code = `console.log(${msg});\n`;
	return code;
};
