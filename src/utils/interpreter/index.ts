import Interpreter from 'js-interpreter-npm';
import jupInterpreter from './jupiter';
import uiInterpreter from './ui';
import walletInterpreter from './wallet';

export function interpreterConfig(jsInterpreter: typeof Interpreter, scope: any) {
	uiInterpreter(jsInterpreter, scope);

	walletInterpreter(jsInterpreter, scope);

	jupInterpreter(jsInterpreter, scope);
}
