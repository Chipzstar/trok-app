import React from 'react';
import { useLocalStorage } from '@mantine/hooks';
import { STORAGE_KEYS } from '../utils/constants';

interface PageContainerProps {
	children: JSX.Element | JSX.Element[];
	header?: JSX.Element;
	classNames?: string;
}

const PageContainer = ({ children, header = null, classNames = 'h-screen' }: PageContainerProps) => {
	const [business, setBusinessInfo] = useLocalStorage({ key: STORAGE_KEYS.COMPANY_FORM, defaultValue: null });
	return (
		<div className={classNames}>
			{header}
			{children}
		</div>
	);
};

const Header = ({ children, classNames = 'bg-white mb-6 flex items-center justify-between px-6', height = 75 }) => {
	return (
		<div
			className={classNames}
			style={{
				height
			}}
		>
			{children}
		</div>
	);
};

PageContainer.Header = Header;

const Body = ({ children, classNames = 'px-6' }) => {
	return <div className={classNames}>{children}</div>;
};

PageContainer.Body = Body;

export default PageContainer;
