import * as React from 'react';
import classNames from 'classnames';

interface ButtonProps {
	type?: 'button' | 'reset' | 'submit' | undefined;
}

const Button: React.FC<ButtonProps & React.HTMLProps<HTMLButtonElement>> = ({
	className,
	disabled = false,
	onClick,
	children,
	type,
	...props
}) => {
	return (
		<button
			type={type}
			className={classNames(
				'border bg-black text-white px-10 py-2 rounded-lg',
				{
					'cursor-not-allowed bg-black/50': disabled,
				},
				className
			)}
			disabled={disabled}
			onClick={onClick}
			{...props}
		>
			{children}
		</button>
	);
};

export default Button;
