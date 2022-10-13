import React, { useState } from 'react';
import useWindowSize from '../hooks/useWindowSize';
import { ScrollArea, Text, Stepper } from '@mantine/core';
import Step1 from '../containers/Step1';
import Step2 from '../containers/Step2';
import Step3 from '../containers/Step3';
import SignUpComplete from '../containers/SignUpComplete';
import { useLocalStorage } from '@mantine/hooks';
import { STORAGE_KEYS } from '../utils/constants';

const onboarding = ({ auth, setAuth }) => {
	const [complete, setComplete] = useLocalStorage({ key: STORAGE_KEYS.COMPLETE, defaultValue: false });
	const [active, setActive] = useState(0);
	const { height } = useWindowSize();
	const nextStep = () => setActive(current => (current < 4 ? current + 1 : current));
	const prevStep = () => setActive(current => (current > 0 ? current - 1 : current));

	return (
		<ScrollArea.Autosize maxHeight={height} mx='auto'>
			{!complete ? (
				<div className='flex min-h-screen flex-col justify-center p-5'>
					<Text mb='md' size='lg' className='text-center'>
						Step {active + 1} of 3
					</Text>
					<Stepper
						iconSize={25}
						completedIcon={<div className='bg-white' />}
						active={active}
						onStepClick={setActive}
						size='xs'
						styles={{
							stepBody: {
								display: 'none'
							},
							step: {
								padding: 0
							},
							stepIcon: {
								// border: '2px solid #D0D7DE',
								borderWidth: 2
							},
							separator: {
								marginLeft: -2,
								marginRight: -2,
								// background:	'repeating-linear-gradient(to right,lightgray 0,lightgray 10px,transparent 10px,transparent 12px)'
							}
						}}
						classNames={{
							root: 'flex flex-col items-center',
							steps: 'w-1/3 px-20',
							content: 'w-1/3 h-full',
						}}
					>
						<Stepper.Step icon={<div />} label='First step' description='Create an account'>
							<Step1 nextStep={nextStep} />
						</Stepper.Step>
						<Stepper.Step icon={<div />} label='Second step' description='Financial'>
							<Step2 nextStep={nextStep} />
						</Stepper.Step>
						<Stepper.Step icon={<div />} label='Final step' description='Location'>
							<Step3 finish={setComplete} />
						</Stepper.Step>
					</Stepper>
				</div>
			) : (
				<SignUpComplete auth={auth} setAuth={setAuth} />
			)}
		</ScrollArea.Autosize>
	);
};

export default onboarding;
