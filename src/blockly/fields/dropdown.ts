import Blockly from 'blockly';
import debounce from 'lodash.debounce';
import startCase from 'lodash.startcase';

export interface CustomDropdownOption {
	img?: string;
	label: string;
	value: string;
}

class CustomDropdown extends Blockly.FieldDropdown {
	constructor(private customMenuGenerator: Array<CustomDropdownOption>) {
		const fieldDropdownOptions = customMenuGenerator.length
			? customMenuGenerator.map(menu => [menu.label, menu.value])
			: [['', '']];
		super(fieldDropdownOptions);
	}

	static fromJson(param: any): Blockly.FieldDropdown {
		const { options } = param;
		if (!options) throw new Error('No options provided to CustomDropdown');

		if (typeof options === 'function') {
			return new CustomDropdown(options());
		}

		return new CustomDropdown(options);
	}

	private generateMenuList({
		container,
		img,
		label,
		value,
	}: {
		container: HTMLElement;
		img?: string;
		label: string;
		value: string;
	}) {
		const rowEl = document.createElement('div');
		rowEl.classList.add('flex');
		rowEl.classList.add('flex-row');
		rowEl.classList.add('items-center');
		rowEl.classList.add('space-x-4');
		rowEl.classList.add('p-2');
		rowEl.classList.add('border-b');
		rowEl.classList.add('cursor-pointer');
		rowEl.onclick = () => {
			this.setValue(value);
			Blockly.DropDownDiv.hide();
		};

		let selectedEl;
		if (this.getValue() === value) {
			selectedEl = document.createElement('div');
			selectedEl.textContent = '✔️';
		}

		if (selectedEl) {
			rowEl.appendChild(selectedEl);
			rowEl.classList.add('bg-gray-100');
		}

		if (img) {
			const imgEl = document.createElement('img');
			imgEl.setAttribute('src', img);
			imgEl.setAttribute('width', '25');
			imgEl.setAttribute('height', '25');
			rowEl.appendChild(imgEl);
		}

		const labelEl = document.createElement('div');
		labelEl.textContent = label;
		labelEl.classList.add('text-sm');
		labelEl.classList.add('font-medium');
		labelEl.classList.add('text-black/50');
		rowEl.appendChild(labelEl);

		container.appendChild(rowEl);
	}

	private onInputChange(evt: any) {
		const search = evt?.target?.value ?? '';

		const filteredMenu = search
			? this.customMenuGenerator.filter(menu => menu.label.toUpperCase().includes(search.toUpperCase()))
			: this.customMenuGenerator;

		const dropdownList = document.getElementById('custom_dropdown_list');
		if (!dropdownList) return;

		dropdownList.innerHTML = '';
		filteredMenu.forEach(({ img, label, value }) =>
			this.generateMenuList({ container: dropdownList, img, label, value })
		);
	}

	private createDropdown() {
		const container = document.createElement('div');
		container.classList.add('flex');
		container.classList.add('flex-col');

		const inputContainer = document.createElement('div');
		inputContainer.classList.add('sticky');
		inputContainer.classList.add('p-2');

		const input = document.createElement('input');
		input.setAttribute('placeholder', 'Search and Enter');
		input.classList.add('border');
		input.classList.add('rounded');
		input.classList.add('p-2');
		input.classList.add('w-full');
		input.onchange = this.onInputChange.bind(this);

		inputContainer.appendChild(input);
		container.appendChild(inputContainer);

		const dropdownList = document.createElement('div');
		dropdownList.setAttribute('id', 'custom_dropdown_list');
		dropdownList.classList.add('flex');
		dropdownList.classList.add('flex-col');
		dropdownList.classList.add('overflow-y-auto');
		dropdownList.classList.add('max-h-72');

		container.appendChild(dropdownList);

		this.customMenuGenerator.forEach(({ img, label, value }) =>
			this.generateMenuList({ container: dropdownList, img, label, value })
		);

		return container;
	}

	protected showEditor_(_e?: Event | undefined): void {
		const dropdownDOM = this.createDropdown();
		Blockly.DropDownDiv.getContentDiv().appendChild(dropdownDOM);
		Blockly.DropDownDiv.showPositionedByField(this);
	}

	protected updateMenu(menu: Array<CustomDropdownOption>) {
		this.customMenuGenerator = menu;
		// @ts-ignore
		super.menuGenerator_ = menu.map(({ label, value }) => [label, value]);
	}

	setValue(newValue: any): void {
		super.setValue(newValue);
	}
}

Blockly.fieldRegistry.unregister('custom_dropdown');
Blockly.fieldRegistry.register('custom_dropdown', CustomDropdown);
