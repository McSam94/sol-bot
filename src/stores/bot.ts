import { convertStoreToHooks } from '@utils/store';
import create from 'zustand/vanilla';

interface BotStoreInt {
	botStatus: 'idle' | 'running' | 'stopping';
	invalidBlocks: Array<string>;
	removeInvalidBlock: (id: string) => void;
	addInvalidBlock: (id: string) => void;
}

const BotStore = create<BotStoreInt>((set, get) => ({
	botStatus: 'idle',
	invalidBlocks: [],
	removeInvalidBlock: (id: string) =>
		set(prevState => ({
			...prevState,
			invalidBlocks: [...prevState.invalidBlocks.filter(blockId => blockId !== id)],
		})),
	addInvalidBlock: (id: string) => {
		const { invalidBlocks } = get();

		if (invalidBlocks.includes(id)) return;
		set(prevState => ({ ...prevState, invalidBlocks: [...prevState.invalidBlocks, id] }));
	},
}));

export default BotStore;
export const useBotStore = convertStoreToHooks<BotStoreInt>(BotStore);
