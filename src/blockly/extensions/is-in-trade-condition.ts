import BotStore from '@stores/bot';
import { validateBlockInParent } from '@utils/blockly';
import Blockly, { BlockSvg } from 'blockly';

Blockly.Extensions.unregister('is-in-trade-condition');
Blockly.Extensions.register('is-in-trade-condition', function (this: BlockSvg) {
	const _this = this;
	this.setOnChange(function (event: Blockly.Events.Abstract) {
		if (event instanceof Blockly.Events.BlockMove) return;

		validateBlockInParent(_this, 'exchange_condition', `This block need to place under 'Exchange Condition' block`);
	});
});
