import TokenStore from '@stores/token';
import Blockly, { BlockSvg } from 'blockly';

Blockly.Blocks.token_price = {
	init() {
		this.jsonInit(this.definition());
	},
	definition() {
		return {
			message0: 'Token price of %1 in %2',
			args0: [
				{
					type: 'custom_dropdown',
					name: 'TOKEN_PRICE',
					options: TokenStore.getState().getCoinDropdown() ?? [['', '']],
				},
				{
					type: 'custom_dropdown',
					name: 'CONVERT_CURRENCY',
					options: TokenStore.getState().getCurrencyDropdown() ?? [['', '']],
				},
			],
			colour: 230,
			output: null,
		};
	},
};

Blockly.JavaScript.token_price = (block: BlockSvg) => {
	const tokenId = block.getFieldValue('TOKEN_PRICE');
	const currency = block.getFieldValue('CONVERT_CURRENCY');

	return [`Number(getTokenPrice('${tokenId}', '${currency}'))`, Blockly.JavaScript.ORDER_ATOMIC];
};
