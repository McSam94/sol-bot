import * as React from 'react';
import { StoreApi } from 'zustand';

export const convertStoreToHooks = <T extends object>(store: StoreApi<T>) => {
	return () => {
		const [state, setState] = React.useState<T>(store.getState());

		React.useEffect(() => {
			store.subscribe((nextState: T, prevState: T) => {
				if (nextState === prevState) return;

				setState(nextState);
			});
		}, []);

		return { ...state, setState: store.setState };
	};
};
