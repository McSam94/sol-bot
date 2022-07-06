export const fromDecimal = (amount: number, decimal: number) => {
	return amount / Math.pow(10, decimal);
};

export const toDecimal = (amount: number, decimal: number) => {
	return amount * Math.pow(10, decimal);
};
