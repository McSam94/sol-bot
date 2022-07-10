import * as React from 'react';

interface ComputeRoutesPendingProps {
	title: string;
	subtitle: string;
}

export const ComputeRoutesPending: React.FC<ComputeRoutesPendingProps> = ({ title, subtitle }) => {
	return (
		<div className='flex flex-col'>
			<span>{title}</span>
			<span>{subtitle}</span>
		</div>
	);
};
