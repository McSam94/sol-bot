import * as React from 'react';
import ReactModal, { Props as ReactModalProps } from 'react-modal';

if (typeof window !== 'undefined') {
	ReactModal.setAppElement('#__next');
}

const Modal: React.FC<React.PropsWithChildren<ReactModalProps>> = ({ children, ...props }) => {
	return (
		<ReactModal
			shouldCloseOnEsc
			shouldCloseOnOverlayClick
			overlayElement={(props, contentElement) => (
				<div {...props} className={`z-100 ${props.className}`}>
					{contentElement}
				</div>
			)}
			contentElement={(props, children) => (
				<div
					{...props}
					className={`z-100 !rounded-lg !inset-1/2 -translate-x-1/2 -translate-y-1/2 ${props.className}`}
				>
					{children}
				</div>
			)}
			{...props}
		>
			{children}
		</ReactModal>
	);
};

export default Modal;
