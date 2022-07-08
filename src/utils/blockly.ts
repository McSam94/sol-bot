import Blockly, { Block, BlockSvg } from 'blockly';
import filesaver from 'file-saver';
import BotStore from '@stores/bot';

export const xmlToStr = (xml: Node) => {
	const serializer = new XMLSerializer();
	return serializer.serializeToString(xml);
};

export const fetchXml = (filePath: string) => {
	return new Promise(resolve => {
		const xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
				resolve(this.responseText);
			}
		};
		xhttp.open('GET', filePath, true);
		xhttp.send();
	});
};

export const generateCode = (code: string) => {
	return `
		var shouldLoop = true;

		// Define wallet
		var wallet = getWallet();

		${code}\n

		while(shouldLoop) {
			try {
				if (!JupDefinition) toast.error('Exchange Parameter block is mandatory to be in the workspace');
				JupDefinition();

				if (JupExchange) {
					JupExchange();
				}

				if (JupLoop) {
					shouldLoop = JupLoop();
				}
			} catch (error) {
				console.error(error);
				error(error);
				shouldLoop = false;
			}
		}

		stopBot();
	`;
};

export const saveAs = ({ data, filename, opts }: { data: string; filename: string; opts: BlobPropertyBag }) => {
	const blob = new Blob([data], opts);
	filesaver.saveAs(blob, filename);
};

/** ---Block Utils Start--- */
/**
 * Given a BlockSvg, return the first descendant of that BlockSvg that has the given type.
 * @param {BlockSvg} block - The block to search.
 * @param {string} type - The type of the child block you want to find.
 */
export const getChildByType = (block: BlockSvg, type: string) =>
	block.getDescendants(true).find(child => child.type === type);

/**
 * It gets the value of a field from a block
 * @param {BlockSvg | Block | undefined} block - The block that the field is on.
 * @param {string} fieldName - The name of the field to get the value from.
 * @returns A function that takes a block and a field name and returns a string.
 */
export const getInputValue = (block: BlockSvg | Block | undefined, fieldName: string) => {
	const inputBlock = block?.getInputTargetBlock(fieldName);
	const isVariable = inputBlock?.type === 'variables_get';

	const value = Blockly.JavaScript.valueToCode(block, fieldName, Blockly.JavaScript.ORDER_ATOMIC);

	return isVariable ? value : `'${value}'`;
};

/**
 * It takes a block and a warning message, and if the warning message is not null, it sets the warning
 * text on the block and adds the block to the list of invalid blocks
 * @param {BlockSvg} block - The block that we want to update the status of.
 * @param {string | null} [warningMsg=null] - The warning message to display. If null, the warning is
 * cleared.
 * @returns The function updateBlockStatus is being returned.
 */
const updateBlockStatus = (block: BlockSvg, warningMsg: string | null = null) => {
	if (!warningMsg) {
		block.setWarningText(null);
		Blockly.utils.dom.removeClass(block.getSvgRoot(), 'block--error');
		BotStore.getState().removeInvalidBlock(block.id);
		return;
	}

	block.setWarningText(warningMsg);
	Blockly.utils.dom.addClass(block.getSvgRoot(), 'block--error');
	BotStore.getState().addInvalidBlock(block.id);
};

/**
 * > If the block is not in the flyout and is rendered, check if the block is in the correct parent. If
 * it is, update the block status to be valid. If it isn't, update the block status to be invalid
 * @param {BlockSvg} block - BlockSvg - The block to validate
 * @param {string} parentType - The type of the parent block that the block must be in.
 * @param {string} warningMsg - The message to display in the warning tooltip.
 * @returns A function that takes in a block, a parentType, and a warningMsg.
 */
export const validateBlockInParent = (block: BlockSvg, parentType: string, warningMsg: string) => {
	if (block.isInFlyout || !block.rendered) return;

	if (block.getRootBlock().type === parentType) {
		updateBlockStatus(block);
		return;
	}

	updateBlockStatus(block, warningMsg);
};

/**
 * "If the block is not in the flyout and is rendered, check if any of its descendants are not of the
 * specified type. If so, update the block status."
 *
 * The first thing we do is check if the block is in the flyout or not rendered. If so, we return. This
 * is because we don't want to show warnings for blocks in the flyout, and we don't want to show
 * warnings for blocks that aren't rendered
 * @param {BlockSvg} block - BlockSvg - The block to validate
 * @param {string} childrenType - The type of block that should be a child of this block.
 * @param {string} warningMsg - The message to display in the warning tooltip.
 * @returns A function that takes in a block, a childrenType, and a warningMsg.
 */
export const validateBlockHasChildren = (block: BlockSvg, childrenType: string, warningMsg: string) => {
	if (block.isInFlyout || !block.rendered) return;

	if (block.getDescendants(true).some((block: Block) => block.type === childrenType)) {
		updateBlockStatus(block);
		return;
	}

	updateBlockStatus(block, warningMsg);
};
/** ---Block Utils End--- */
