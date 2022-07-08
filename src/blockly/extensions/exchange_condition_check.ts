import BotStore from '@stores/bot';
import { validateBlockInParent } from '@utils/blockly';
import Blockly, { BlockSvg } from 'blockly';

Blockly.Extensions.unregister('exchange_condition_check');
Blockly.Extensions.register('exchange_condition_check', function (this: BlockSvg) {
	const _this = this;
	this.setOnChange(function (event: Blockly.Events.Abstract) {
		if (event instanceof Blockly.Events.BlockMove) return;

		validateBlockInParent(_this, 'exchange_condition', `This block need to place under 'Exchange Condition' block`);
	});
});
