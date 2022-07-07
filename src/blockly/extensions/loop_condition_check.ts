import BotStore from '@stores/bot';
import Blockly, { BlockSvg } from 'blockly';

Blockly.Extensions.unregister('loop_condition_check');
Blockly.Extensions.register('loop_condition_check', function (this: BlockSvg) {
	const _this = this;
	this.setOnChange(function (event: Blockly.Events.Abstract) {
		if (event.type !== Blockly.Events.MOVE) return;

		if (_this.getRootBlock().type !== 'loop_condition') {
			_this.setWarningText('This block need to placed inside `Restart Condition`');
			Blockly.utils.dom.addClass(_this.getSvgRoot(), 'block--error');
			BotStore.setState({ isWorkspaceValid: false });
		} else {
			_this.setWarningText(null);
			Blockly.utils.dom.removeClass(_this.getSvgRoot(), 'block--error');
			BotStore.setState({ isWorkspaceValid: true });
		}
	});
});
