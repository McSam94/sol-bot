import BotStore from '@stores/bot';
import { validateBlockHasChildren } from '@utils/blockly';
import Blockly, { BlockSvg } from 'blockly';

Blockly.Extensions.unregister('exchange_amount_check');
Blockly.Extensions.register('exchange_amount_check', function (this: BlockSvg) {
	const _this = this;
	this.setOnChange(function (event: Blockly.Events.Abstract) {
		if (event instanceof Blockly.Events.BlockMove) return;

		validateBlockHasChildren(
			_this,
			'exchange_amount',
			`'Exchange Amount' block is mandatory to place inside this block`
		);
	});
});
