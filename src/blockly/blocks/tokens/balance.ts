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
					type: 'custom_dropdown',
					name: 'TOKEN_BALANCE',
					options: JupStore.getState().getTokensDropdown() ?? [['', '']],
				},
			],
			colour: 230,
			output: null,
		};
	},
};

Blockly.JavaScript.balance = (block: BlockSvg) => {
	const tokenMint = block.getFieldValue('TOKEN_BALANCE');

	return [`Number(getBalance(wallet, '${tokenMint}'))`, Blockly.JavaScript.ORDER_ATOMIC];
};
