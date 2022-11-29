import React from 'react';
import { Button } from '@mantine/core';
const Test = () => {
	return (
		<div className='container py-5 flex h-screen items-center justify-center'>
			<Button
				type="button"
				onClick={() => {
					throw new Error("Sentry Frontend Error");
				}}
			>
				Throw error
			</Button>
		</div>
	);
};

export default Test;
