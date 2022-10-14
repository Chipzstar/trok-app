import React from 'react';
import { DEFAULT_HEADER_HEIGHT } from '../utils/constants';

interface PageContainerProps {
	children: JSX.Element | JSX.Element[];
	header?: JSX.Element;
	classNames?: string;
}

const Page = ({children}) => {
	return ({children})
}

const Container = ({ children, header = null, classNames = 'h-screen flex flex-col' }: PageContainerProps) => {
	return (
		<div className={classNames}>
			{header}
			{children}
		</div>
	);
};

Page.Container = Container;

const Header = ({ children, classNames = 'bg-white mb-4 flex items-center justify-between px-6', extraClassNames="", height = DEFAULT_HEADER_HEIGHT }) => {
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

Page.Header = Header;

const Body = ({ children, classNames = 'px-6 flex flex-col grow', extraClassNames="" }) => {
	return <div className={`${classNames} ${extraClassNames}`}>{children}</div>;
};

Page.Body = Body;

export default Page;
