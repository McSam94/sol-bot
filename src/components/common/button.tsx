import * as React from 'react';
import classNames from 'classnames';

interface ButtonProps {
	className?: string;
	disabled?: boolean;
	onClick?: Function;
}

const Button: React.FC<React.PropsWithChildren<ButtonProps>> = ({ className, disabled = false, onClick, children }) => {
	return (
		<button
			className={classNames(
				'border bg-black text-white px-10 py-2 rounded-lg',
				{
					'cursor-not-allowed bg-black/50': disabled,
				},
				className
			)}
			disabled={disabled}
			onClick={() => onClick?.()}
		>
			{children}
		</button>
	);
};

export default Button;
