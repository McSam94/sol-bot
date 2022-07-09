import * as React from 'react';
import dynamic from 'next/dynamic';

const IconSrc: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
	trash: dynamic(() => import('public/icons/trash.svg')),
	clear: dynamic(() => import('public/icons/clear.svg')),
	play: dynamic(() => import('public/icons/play.svg')),
	stop: dynamic(() => import('public/icons/stop.svg')),
	save: dynamic(() => import('public/icons/save.svg')),
	upload: dynamic(() => import('public/icons/upload.svg')),
};

interface IconProps {
	name: string;
	color?: string;
	colorFn?: ({ hover }: { hover: boolean }) => string;
	[x: string]: any;
}

const Icon: React.FunctionComponent<IconProps & React.SVGProps<SVGSVGElement>> = ({
	name,
	color,
	colorFn,
	height,
	width,
	size = 20,
	...props
}) => {
	const [isHovered, setIsHovered] = React.useState(false);

	const Component = React.useMemo(() => IconSrc[name], [name]);

	if (!Component) return null;

	return (
		<Component
			fill={colorFn?.({ hover: isHovered }) ?? color ?? 'black'}
			width={width ?? size}
			height={height ?? size}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			{...props}
		/>
	);
};

export default Icon;
