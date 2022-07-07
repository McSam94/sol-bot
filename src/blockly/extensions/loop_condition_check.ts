import { validateBlockInParent } from '@utils/blockly';
import Blockly, { BlockSvg } from 'blockly';

Blockly.Extensions.unregister('loop_condition_check');
Blockly.Extensions.register('loop_condition_check', function (this: BlockSvg) {
	const _this = this;
	this.setOnChange(function (event: Blockly.Events.Abstract) {
		if (event.type !== Blockly.Events.MOVE) return;

		validateBlockInParent(_this, 'loop_condition');
	});
});
