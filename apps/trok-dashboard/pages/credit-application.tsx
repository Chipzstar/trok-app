import React, { useCallback, useMemo } from 'react';
import useWindowSize from '../hooks/useWindowSize';
import { Anchor, ScrollArea, Stack, Stepper, Text } from '@mantine/core';
import { PATHS } from '../utils/constants';
import { useRouter } from 'next/router';
import { authOptions } from './api/auth/[...nextauth]';
import { unstable_getServerSession } from 'next-auth';
import Step1 from '../containers/apply-credit/Step1';
import Step3 from '../containers/apply-credit/Step3';
import Step4 from '../containers/apply-credit/Step4';
import Complete from '../containers/apply-credit/Complete';

const CreditApplication = ({ session_id }) => {
	const router = useRouter();
	const { height } = useWindowSize();

	const active = useMemo(() => {
		return isNaN(Number(router.query?.page)) ? 0 : Number(router.query?.page) - 1;
	}, [router.query]);

	const nextStep = useCallback(() => {
		router.replace({
			pathname: PATHS.CREDIT_APPLICATION,
			query: {
				page: active + 2
			}
		});
	}, [active, router]);

	const prevStep = useCallback(() => {
		router.replace({
			pathname: PATHS.CREDIT_APPLICATION,
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
					{active < 2 ? `Step ${active + 1} of 3` : 'Complete'}
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
						<Step1 nextStep={nextStep} />
					</Stepper.Step>
					<Stepper.Step
						icon={<div />}
						label='Second step'
						description='Financial'
						allowStepSelect={active > 1}
					>
						{customerSupportNumber}
						<Step3 prevStep={prevStep} nextStep={nextStep} />
					</Stepper.Step>
					<Stepper.Step
						icon={<div />}
						label='Third step'
						description='Location'
						allowStepSelect={active > 2}
					>
						{customerSupportNumber}
						<Step4 nextStep={nextStep} prevStep={prevStep} />
					</Stepper.Step>
					<Stepper.Completed>
						<Complete />
					</Stepper.Completed>
				</Stepper>
			</div>
		</ScrollArea.Autosize>
	);
};

export async function getServerSideProps({ req, res }) {
	// @ts-ignore
	const session = await unstable_getServerSession(req, res, authOptions);
	if (!session) {
		return {
			redirect: {
				destination: PATHS.LOGIN,
				permanent: false
			}
		};
	}
	return {
		props: {
			session_id: session.id
		}
	};
}

export default CreditApplication;