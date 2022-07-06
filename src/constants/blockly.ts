export const TOOLBOX = Object.freeze({
	kind: 'categoryToolbox',
	contents: [
		{
			kind: 'category',
			name: 'Exchange Definition',
			categorystyle: 'logic_category',
			contents: [
				{
					kind: 'block',
					type: 'exchange_definition',
				},
				{
					kind: 'block',
					type: 'exchange_parameter',
				},
				{
					kind: 'block',
					type: 'exchange_amount',
				},
				{
					kind: 'block',
					type: 'exchange_slippage',
				},
			],
		},
		{
			kind: 'category',
			name: 'Exchange Condition',
			categorystyle: 'math_category',
			contents: [
				{
					kind: 'block',
					type: 'exchange_condition',
				},
				{
					kind: 'block',
					type: 'exchange_swap',
				},
			],
		},
		{
			kind: 'category',
			name: 'Exchange Again',
			contents: [
				{
					kind: 'block',
					type: 'loop_condition',
				},
				{
					kind: 'block',
					type: 'exchange_again',
				},
			],
		},
		{
			kind: 'category',
			name: 'Routes',
			contents: [
				{
					kind: 'block',
					type: 'route_property',
				},
			],
		},
		{
			kind: 'category',
			name: 'Util',
			contents: [
				{
					kind: 'block',
					type: 'controls_if',
				},
				{
					kind: 'block',
					type: 'controls_repeat_ext',
				},
				{
					kind: 'block',
					type: 'logic_compare',
				},
				{
					kind: 'block',
					type: 'math_number',
				},
				{
					kind: 'block',
					type: 'math_arithmetic',
				},
				{
					kind: 'block',
					type: 'text',
				},
				{
					kind: 'block',
					type: 'text_print',
				},
			],
		},
	],
});
