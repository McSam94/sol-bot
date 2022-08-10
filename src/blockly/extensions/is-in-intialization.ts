import BotStore from '@stores/bot';
import { validateBlockInParent } from '@utils/blockly';
import Blockly, { BlockSvg } from 'blockly';

Blockly.Extensions.unregister('is-in-initialization');
Blockly.Extensions.register('is-in-initialization', function (this: BlockSvg) {
	const _this = this;
	this.setOnChange(function (event: Blockly.Events.Abstract) {
		if (event instanceof Blockly.Events.BlockMove) return;

		validateBlockInParent(_this, 'initialization', `This block need to place under 'Exchange Definition'`);
	});
});
