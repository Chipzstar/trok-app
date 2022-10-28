import React from 'react';
import { TextInput } from '@mantine/core';

const DynamicInputField = ({ disabled = false, editMode, onFocus, onBlur, value, onChange, error, isPassword = false }) => {
	return editMode ? (
		<TextInput disabled={disabled} value={value} onChange={onChange} error={error} onBlur={onBlur} onFocus={onFocus}  />
	) : (
		<span className='font-semibold'>{isPassword ? '***********' : value}</span>
	);
};

export default DynamicInputField;
