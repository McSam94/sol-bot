import Interpreter from 'js-interpreter-npm';
import toast from 'react-hot-toast';
import BotStore from '@stores/bot';

const uiInterpreter = (jsInterpreter: typeof Interpreter, scope: any) => {
	jsInterpreter.setProperty(scope, 'console', jsInterpreter.nativeToPseudo(console));
	jsInterpreter.setProperty(
		scope,
		'alert',
		jsInterpreter.createNativeFunction((message: string) => alert(message))
	);

	jsInterpreter.setProperty(
		scope,
		'toast',
		jsInterpreter.createNativeFunction((content: string, type: 'success' | 'error') => {
			toast[type](content);
		})
	);

	// Check if stop button is clicked
	jsInterpreter.setProperty(
		scope,
		'shouldBotStop',
		jsInterpreter.createNativeFunction(function () {
			const shouldStop = BotStore.getState().botStatus !== 'running';
			return shouldStop;
		})
	);

	// Update bot status to 'idle'
	jsInterpreter.setProperty(
		scope,
		'stopBot',
		jsInterpreter.createNativeFunction(function () {
			BotStore.setState({ botStatus: 'idle' });
		})
	);
};

export default uiInterpreter;
