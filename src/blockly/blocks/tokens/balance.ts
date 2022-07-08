import JupStore from '@stores/jupiter';
import Blockly, { BlockSvg } from 'blockly';

Blockly.Blocks.balance = {
	init() {
		this.jsonInit(this.definition());
	},
	definition() {
		return {
			message0: 'Balance %1',
			args0: [
				{
					type: 'field_dropdown',
					name: 'TOKEN_BALANCE',
					options: JupStore.getState().getTokensDropdown() ?? [['', '']],
				},
			],
			output: null,
		};
	},
};

Blockly.JavaScript.balance = (block: BlockSvg) => {
	const tokenMint = block.getFieldValue('TOKEN_BALANCE');

	return [`Number(getBalance('${tokenMint}'))`, Blockly.JavaScript.ORDER_ATOMIC];
};
