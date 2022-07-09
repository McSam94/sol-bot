import { convertStoreToHooks } from '@utils/store';
import { Id } from 'react-toastify';
import create from 'zustand/vanilla';

interface BotStoreInt {
	botStatus: 'idle' | 'running' | 'stopping';
	invalidBlocks: Array<string>;
	missingMandatoryBlocks: Array<string>;
	extraBlocks: Array<string>;
	removeInvalidBlock: (id: string) => void;
	addInvalidBlock: (id: string) => void;
	removeMissingBlock: (type: string) => void;
	addMissingBlock: (type: string) => void;
	removeExtraBlock: (type: string) => void;
	addExtraBlock: (type: string) => void;
}

const BotStore = create<BotStoreInt>((set, get) => ({
	botStatus: 'idle',
	invalidBlocks: [],
	missingMandatoryBlocks: [],
	extraBlocks: [],
	removeInvalidBlock: (id: string) =>
		set(prevState => ({
			...prevState,
			invalidBlocks: [...prevState.invalidBlocks.filter(blockId => blockId !== id)],
		})),
	addInvalidBlock: (id: string) => {
		set(prevState => {
			if (prevState.invalidBlocks.includes(id)) return prevState;

			return { ...prevState, invalidBlocks: [...prevState.invalidBlocks, id] };
		});
	},
	removeMissingBlock: (type: string) => {
		set(prevState => ({
			...prevState,
			missingMandatoryBlocks: [...prevState.missingMandatoryBlocks.filter(blockType => blockType !== type)],
		}));
	},
	addMissingBlock: (type: string) => {
		set(prevState => {
			if (prevState.missingMandatoryBlocks.includes(type)) return prevState;

			return { ...prevState, missingMandatoryBlocks: [...prevState.missingMandatoryBlocks, type] };
		});
	},
	removeExtraBlock: (type: string) => {
		set(prevState => ({
			...prevState,
			extraBlocks: [...prevState.extraBlocks.filter(blockType => blockType !== type)],
		}));
	},
	addExtraBlock: (type: string) => {
		set(prevState => {
			if (prevState.extraBlocks.includes(type)) return prevState;

			return { ...prevState, extraBlocks: [...prevState.extraBlocks, type] };
		});
	},
}));

export default BotStore;
export const useBotStore = convertStoreToHooks<BotStoreInt>(BotStore);
