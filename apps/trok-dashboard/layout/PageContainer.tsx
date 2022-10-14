import React from 'react';
import { DEFAULT_HEADER_HEIGHT } from '../utils/constants';

interface PageContainerProps {
	children: JSX.Element | JSX.Element[];
	header?: JSX.Element;
	classNames?: string;
}

const PageContainer = ({ children, header = null, classNames = 'h-screen flex flex-col' }: PageContainerProps) => {
	return (
		<div className={classNames}>
			{header}
			{children}
		</div>
	);
};

const Header = ({ children, classNames = 'bg-white mb-6 flex items-center justify-between px-6', extraClassNames="", height = DEFAULT_HEADER_HEIGHT }) => {
	return (
		<div
			className={`${classNames} ${extraClassNames}`}
			style={{
				height,
				minHeight: height
			}}
		>
			{children}
		</div>
	);
};

PageContainer.Header = Header;

const Body = ({ children, classNames = 'px-6 flex flex-col grow', extraClassNames="" }) => {
	return <div className={`${classNames} ${extraClassNames}`}>{children}</div>;
};

PageContainer.Body = Body;

export default PageContainer;
