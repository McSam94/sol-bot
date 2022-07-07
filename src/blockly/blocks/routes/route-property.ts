import { RouteInfo } from '@jup-ag/core';
import Blockly, { BlockSvg } from 'blockly';
import JupStore from '@stores/jupiter';

Blockly.Blocks.route_property = {
	init() {
		this.jsonInit(this.definition());
	},
	definition() {
		return {
			message0: 'Best route property: %1',
			args0: [
				{
					type: 'field_dropdown',
					name: 'ROUTE_PROPERTY',
					options: JupStore.getState().getRoutePropDropdown() ?? [['', '']],
				},
			],
			output: null,
		};
	},
};

Blockly.JavaScript.route_property = (block: BlockSvg) => {
	const routeProp = block.getFieldValue('ROUTE_PROPERTY') as keyof RouteInfo;

	return [`Number(getBestRouteProp('${routeProp}'))`, Blockly.JavaScript.ORDER_ATOMIC];
};
