import React, { useCallback, useMemo } from 'react';
import useWindowSize from '../hooks/useWindowSize';
import { Anchor, ScrollArea, Stack, Stepper, Text } from '@mantine/core';
import { PATHS } from '../utils/constants';
import { useRouter } from 'next/router';
import { authOptions } from './api/auth/[...nextauth]';
import { unstable_getServerSession } from 'next-auth';
import NewStep1 from '../containers/onboarding/NewStep1';
import NewStep2 from '../containers/onboarding/NewStep2';
import NewStep3 from '../containers/onboarding/NewStep3';
import NewStep4 from '../containers/onboarding/NewStep4';
import NewStep5 from '../containers/onboarding/NewStep5';

const Onboarding = () => {
	const router = useRouter();
	const { height } = useWindowSize();

	const active = useMemo(() => {
		return isNaN(Number(router.query?.page)) ? 0 : Number(router.query?.page) - 1;
	}, [router.query]);

	const nextStep = useCallback(() => {
		router.replace({
			pathname: PATHS.ONBOARDING,
			query: {
				page: active + 2
			}
		});
	}, [active, router]);

	const prevStep = useCallback(() => {
		router.replace({
			pathname: PATHS.ONBOARDING,
			query: {
				page: active
			}
		});
	}, [active, router]);

	const customerSupportNumber = (
		<Stack align='center' spacing={0}>
			<Text size='sm'>If you have any questions, please call</Text>
			<Anchor size='sm' href='tel:0333 050 9591'>
				0333 050 9591
			</Anchor>
		</Stack>
	);

	return (
		<ScrollArea.Autosize maxHeight={height} mx='auto'>
			<div className='flex min-h-screen flex-col justify-center bg-white p-5'>
				<Text mb='md' size='lg' className='text-center'>
					Step {active + 1} of 5
				</Text>
				<Stepper
					iconSize={25}
					completedIcon={<div className='bg-white' />}
					active={active}
					size='xs'
					styles={{
						stepBody: {
							display: 'none'
						},
						step: {
							padding: 0
						},
						stepIcon: {
							borderWidth: 2
						},
						separator: {
							marginLeft: -2,
							marginRight: -2
						}
					}}
					classNames={{
						root: 'flex flex-col items-center',
						steps: 'w-1/3 px-20',
						content: 'w-1/3 h-full'
					}}
				>
					<Stepper.Step icon={<div />} label='First step' description='Company' allowStepSelect={active > 0}>
						{customerSupportNumber}
						<NewStep1 nextStep={nextStep} />
					</Stepper.Step>
					<Stepper.Step
						icon={<div />}
						label='Second step'
						description='Representative'
						allowStepSelect={active > 1}
					>
						{customerSupportNumber}
						<NewStep2 prevStep={prevStep} nextStep={nextStep} />
					</Stepper.Step>
					<Stepper.Step
						icon={<div />}
						label='Third step'
						description='Owners'
						allowStepSelect={active > 2}
					>
						{customerSupportNumber}
						<NewStep3 prevStep={prevStep} nextStep={nextStep} />
					</Stepper.Step>
					<Stepper.Step icon={<div />} label='Fourth step' description='Directors' allowStepSelect={active > 3}>
						{customerSupportNumber}
						<NewStep4 nextStep={nextStep} prevStep={prevStep} />
					</Stepper.Step>
					<Stepper.Step icon={<div />} label='Final step' description='Location' allowStepSelect={active > 4}>
						{customerSupportNumber}
						<NewStep5 prevStep={prevStep} />
					</Stepper.Step>
				</Stepper>
			</div>
		</ScrollArea.Autosize>
	);
};

export async function getServerSideProps({ req, res }) {
	// @ts-ignore
	const session = await unstable_getServerSession(req, res, authOptions);
	if (session) {
		return {
			redirect: {
				destination: PATHS.HOME,
				permanent: false
			}
		};
	}
	return {
		props: {
			session
		}
	};
}

export default Onboarding;
