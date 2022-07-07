import BotStore from '@stores/bot';
import Blockly, { BlockSvg } from 'blockly';

Blockly.Extensions.unregister('exchange_definition_check');
Blockly.Extensions.register('exchange_definition_check', function (this: BlockSvg) {
	const _this = this;
	this.setOnChange(function (event: Blockly.Events.Abstract) {
		if (event.type !== Blockly.Events.MOVE) return;

		if (_this.getRootBlock().type !== 'exchange_definition') {
			_this.setWarningText('This block need to placed inside `Exchange Definition`');
			Blockly.utils.dom.addClass(_this.getSvgRoot(), 'block--error');
			BotStore.setState({ isWorkspaceValid: false });
		} else {
			_this.setWarningText(null);
			Blockly.utils.dom.removeClass(_this.getSvgRoot(), 'block--error');
			BotStore.setState({ isWorkspaceValid: true });
		}
	});
});
