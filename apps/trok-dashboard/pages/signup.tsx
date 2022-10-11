import { Stepper } from '@mantine/core';
import React, { useState } from 'react';
import Step1 from '../containers/Step1';
import Step2 from '../containers/Step2';
import Step3 from '../containers/Step3';
import Step4 from '../containers/Step4';
import SignUpComplete from '../containers/SignUpComplete';

export function Signup({ auth, setAuth }) {
	const [active, setActive] = useState(0);
	const [newAccount, setNewAccount] = useState(null);
	const nextStep = () => setActive((current) => (current < 4 ? current + 1 : current));
	const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

	return (
		<div className='min-h-screen flex flex-col justify-center p-5 overflow-x-hidden w-full'>
			{!newAccount ? <Step1 nextStep={setNewAccount} /> :
				<Stepper
					active={active}
					onStepClick={setActive}
					breakpoint='sm'
					styles={{
						stepBody: {
							display: 'none'
						},

						step: {
							padding: 0
						},

						stepIcon: {
							borderWidth: 4
						},

						separator: {
							marginLeft: -2,
							marginRight: -2,
							height: 10
						}
					}}
					classNames={{
						root: 'flex flex-col items-center',
						steps: 'w-1/3',
						content: 'h-full',
					}}>
					<Stepper.Step label='First step' description='Create an account'>
						<Step2 />
					</Stepper.Step>
					<Stepper.Step label='Second step' description='Financial'>
						<Step3 />
					</Stepper.Step>
					<Stepper.Step label='Final step' description='Location'>
						<Step4 nextStep={nextStep} />
					</Stepper.Step>
					<Stepper.Completed>
						<SignUpComplete auth={auth} setAuth={setAuth} />
					</Stepper.Completed>
				</Stepper>}
		</div>
	);
}

export default Signup;
