import React from 'react';
import { InputBase } from '@mantine/core';
import InputMask from 'react-input-mask';

const SortCodeInput = ({value, onChange, required }) => {
	return (
		<InputBase label="Sort Code" required={required} component={InputMask} mask={"99-99-99"} placeholder="XX-XX-XX" value={value} onChange={onChange}/>
	);
};

export default SortCodeInput;
