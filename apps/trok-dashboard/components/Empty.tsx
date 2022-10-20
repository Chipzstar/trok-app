import React from 'react';

const Empty = ({ message }) => {
	return (
		<div className='h-full text-center leading-loose flex items-center'>
			{message}
		</div>
	);
};

export default Empty;
