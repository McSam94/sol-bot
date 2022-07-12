import * as React from 'react';
import dynamic from 'next/dynamic';

const IconSrc = {
	trash: dynamic(() => import('public/icons/trash.svg')),
	clear: dynamic(() => import('public/icons/clear.svg')),
	play: dynamic(() => import('public/icons/play.svg')),
	stop: dynamic(() => import('public/icons/stop.svg')),
	save: dynamic(() => import('public/icons/save.svg')),
	upload: dynamic(() => import('public/icons/upload.svg')),
	exchange: dynamic(() => import('public/icons/exchange.svg')),
	more: dynamic(() => import('public/icons/more.svg')),
	empty: dynamic(() => import('public/icons/empty.svg')),
	discord: dynamic(() => import('public/icons/discord.svg')),
};

interface IconProps {
	name: keyof typeof IconSrc;
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
	fill,
	...props
}) => {
	const [isHovered, setIsHovered] = React.useState(false);

	const Component: React.ComponentType<React.SVGProps<SVGSVGElement>> = React.useMemo(() => IconSrc[name], [name]);

	if (!Component) return null;

	return (
		<Component
			fill={colorFn?.({ hover: isHovered }) ?? color ?? fill}
			width={width ?? size}
			height={height ?? size}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			{...props}
		/>
	);
};

export default Icon;
