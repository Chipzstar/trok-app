import React from 'react';
import { isProd, STORAGE_KEYS } from '../../utils/constants';
import { Navbar, Switch } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';

const TestMode = () => {
	const [testMode, setTestMode] = useLocalStorage({ key: STORAGE_KEYS.TEST_MODE, defaultValue: false });
	return (
		<div className='container py-5'>
			{!isProd && (
				<Navbar.Section py='md' mx='auto'>
					<Switch
						color='orange'
						label='Test mode'
						size='md'
						checked={!!testMode}
						onChange={event => setTestMode(event.currentTarget.checked)}
					/>
				</Navbar.Section>
			)}
		</div>
	);
};

export default TestMode;
