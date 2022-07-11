import * as React from 'react';

const useWindow = () => {
	const [clientWindow, setClientWindow] = React.useState<Window>();

	React.useEffect(() => {
		setClientWindow(window);
	}, []);

	return clientWindow;
};

export default useWindow;
