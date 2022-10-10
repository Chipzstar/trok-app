import { Group, Button, Stepper } from '@mantine/core';
import React, { useState } from 'react';
import Step1 from '../containers/Step1';
import Step2 from '../containers/Step2';
import Step3 from '../containers/Step3';
import Step4 from '../containers/Step4';

export function Index() {
	const [active, setActive] = useState(0)
	const nextStep = () => setActive((current) => (current < 4 ? current + 1 : current));
	const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

	return (
		<div className="h-screen flex flex-col justify-between p-5 overflow-hidden w-full">
			<Stepper active={active} onStepClick={setActive} breakpoint="sm" classNames={{
				content:'h-full',
				root: 'h-full'
			}}>
				<Stepper.Step label="First step" description="Create an account">
					<Step1/>
				</Stepper.Step>
				<Stepper.Step label="Second step" description="Company Information">
					<Step2/>
				</Stepper.Step>
				<Stepper.Step label="Third step" description="Financial">
					<Step3/>
				</Stepper.Step>
				<Stepper.Step label="Final step" description="Address">
					<Step4/>
				</Stepper.Step>
				<Stepper.Completed>
					Completed, click back button to get to previous step
				</Stepper.Completed>
			</Stepper>
			<Group position="center" mt="xl">
				<Button variant="default" onClick={prevStep}>Back</Button>
				<Button onClick={nextStep}>Next step</Button>
			</Group>
		</div>
	);
}

export default Index;
