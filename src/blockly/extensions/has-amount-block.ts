import { validateBlockHasChildren } from '@utils/blockly';
import Blockly, { BlockSvg } from 'blockly';

Blockly.Extensions.unregister('has-amount-block');
Blockly.Extensions.register('has-amount-block', function (this: BlockSvg) {
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
