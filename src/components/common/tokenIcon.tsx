import * as React from 'react';
import Image from 'next/image';
import Unknown from 'public/coins/unknown.svg';

interface TokenProps {
	logoURI?: string;
	size?: number;
	width?: number;
	height?: number;
}

const TokenIcon: React.FC<TokenProps> = ({ logoURI, size, width = 25, height = 25 }) => {
	const [hasError, setHasError] = React.useState<boolean>(false);

	if (!logoURI || hasError) {
		return <Image alt='unknown' src={Unknown} width={size ?? width} height={size ?? height} />;
	}

	return (
		<Image
			priority
			src={logoURI ?? Unknown}
			alt={logoURI}
			width={size ?? width}
			height={size ?? height}
			onError={() => setHasError(true)}
			className='rounded-full'
		/>
	);
};

export default TokenIcon;
