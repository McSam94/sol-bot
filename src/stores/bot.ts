import { convertStoreToHooks } from '@utils/store';
import create from 'zustand/vanilla';

interface BotStoreInt {
	botStatus: 'idle' | 'running' | 'stopping';
	invalidBlocks: Array<string>;
}

const BotStore = create<BotStoreInt>((set, get) => ({
	botStatus: 'idle',
	invalidBlocks: [],
}));

export default BotStore;
export const useBotStore = convertStoreToHooks<BotStoreInt>(BotStore);
