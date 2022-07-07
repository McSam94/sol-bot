import { convertStoreToHooks } from '@utils/store';
import create from 'zustand/vanilla';

interface BotStoreInt {
	botStatus: 'idle' | 'running' | 'stopping';
	isWorkspaceValid: boolean;
}

const BotStore = create<BotStoreInt>(() => ({
	botStatus: 'idle',
	isWorkspaceValid: true,
}));

export default BotStore;
export const useBotStore = convertStoreToHooks<BotStoreInt>(BotStore);
