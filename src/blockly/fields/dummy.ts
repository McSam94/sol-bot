import { Dummy } from '@blockly/blocks/images';
import Blockly from 'blockly';

class DummyField extends Blockly.FieldImage {
	constructor(width = '20', height = '20') {
		super(Dummy, Number(width), Number(height));
	}

	static fromJson(options: any) {
		const width = Blockly.utils.parsing.replaceMessageReferences(options['width']);
		const height = Blockly.utils.parsing.replaceMessageReferences(options['height']);
		return new DummyField(width, height);
	}
}

Blockly.fieldRegistry.unregister('dummy_field');
Blockly.fieldRegistry.register('dummy_field', DummyField);
