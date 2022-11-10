import React from 'react';
import { render } from '@testing-library/react';

import Index from '../pages/index';

describe('Index', () => {
	it('should render successfully', () => {
		const { baseElement } = render(<Index session_id={undefined} stripe_account_id={undefined} testMode={undefined} user={undefined} />);
		expect(baseElement).toBeTruthy();
	});
});
