import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from '@mantine/form';
import { Button, Checkbox, Group, Stack, Text, TextInput } from '@mantine/core';
import { PATHS, STORAGE_KEYS } from '../../utils/constants';
import { useLocalStorage } from '@mantine/hooks';
import {
	AddressInfo,
	CreateUser,
	getE164Number,
	notifyError,
	OnboardingAccountStep3,
	OnboardingBusinessInfo,
	OnboardingFinancialInfo,
	OnboardingLocationInfo,
	SignupInfo
} from '@trok-app/shared-utils';
import { IconX } from '@tabler/icons';
import { trpc } from '../../utils/clients';
import { useRouter } from 'next/router';
import { runGriffinKYBVerification } from '../../utils/functions';
import { GRIFFIN_RISK_RATING } from '../../utils/types';
import { useSession } from 'next-auth/react';

const Step4 = ({ prevStep, nextStep }) => {
	const router = useRouter();
	const { data: session } = useSession();
	const [loading, setLoading] = useState(false);
	const [account, setAccount] = useLocalStorage<OnboardingAccountStep3>({
		key: STORAGE_KEYS.ACCOUNT,
		defaultValue: null
	});
	const [griffin, setGriffin] = useLocalStorage<{ legal_person_url: string | null }>({
		key: STORAGE_KEYS.GRIFFIN,
		defaultValue: null
	});
	const [personalObj, setPersonal] = useLocalStorage<SignupInfo>({ key: STORAGE_KEYS.SIGNUP_FORM });
	const [businessObj, setBusiness] = useLocalStorage<OnboardingBusinessInfo>({ key: STORAGE_KEYS.COMPANY_FORM });
	const [financialObj, setFinancial] = useLocalStorage<OnboardingFinancialInfo>({ key: STORAGE_KEYS.FINANCIAL_FORM });
	const [locationForm, setLocationForm] = useLocalStorage<OnboardingLocationInfo>({
		key: STORAGE_KEYS.LOCATION_FORM,
		defaultValue: {
			line1: '',
			line2: '',
			city: '',
			postcode: '',
			region: '',
			country: '',
			card_business_name: '',
			num_cards: undefined,
			shipping_speed: 'standard',
			diff_shipping_address: false,
			shipping_address: {
				line1: '',
				line2: '',
				city: '',
				postcode: '',
				region: '',
				country: 'England'
			}
		}
	});

	const applyCredit = trpc.user.completeCreditApplication.useMutation();

	const form = useForm<OnboardingLocationInfo>({
		initialValues: {
			...locationForm
		},
		validate: {
			card_business_name: val =>
				val.search(/[^a-zA-Z0-9 ]/g) !== -1
					? 'Card business name must not contain special characters'
					: val.length < 3 || val.length > 24
					? 'Card business name must be between 3-24 characters'
					: null
		}
	});

	const handleSubmit = useCallback(
		async (values: OnboardingLocationInfo) => {
			setLoading(true);
			try {
				const location: AddressInfo = {
					line1: values.line1,
					line2: values?.line2,
					city: values.city,
					postcode: values.postcode,
					region: values.region,
					country: values?.country
				};
				/*const risk_rating = await runGriffinKYBVerification(
					businessObj.business_crn,
					location,
					griffin.legal_person_url
				);
				if (risk_rating === GRIFFIN_RISK_RATING.HIGH)
					throw new Error(
						'We have detected a high risk of fraud based on your responses. We advise you check your responses carefully and try submitting again'
					);*/
				// convert phone number to E164 format
				personalObj.phone = getE164Number(personalObj.phone);
				await applyCredit.mutateAsync({
					userId: session?.id,
					business: {
						...businessObj,
                        ...financialObj,
					},
					card_configuration: {
						card_business_name: values.card_business_name
					},
					location,
					shipping_address: values.diff_shipping_address ? values.shipping_address : location,
				});
				setLoading(false);
                nextStep()
			} catch (err) {
				setLoading(false);
				console.error(err);
				notifyError('onboarding-step3-failure', err?.error?.message ?? err.message, <IconX size={20} />);
			}
		},
		[account, personalObj, businessObj, financialObj]
	);

	useEffect(() => {
		const storedValue = window.localStorage.getItem(STORAGE_KEYS.LOCATION_FORM);
		if (storedValue) {
			try {
				form.setValues(JSON.parse(window.localStorage.getItem(STORAGE_KEYS.LOCATION_FORM)));
			} catch (e) {
				console.log('Failed to parse stored value');
				console.error(e);
			}
		}
	}, []);

	useEffect(() => {
		window.localStorage.setItem(STORAGE_KEYS.LOCATION_FORM, JSON.stringify(form.values));
	}, [form.values]);

	return (
		<div className='min-h-screen'>
			<form onSubmit={form.onSubmit(handleSubmit)} className='flex h-full w-full flex-col' data-cy="onboarding-location-form">
				<h1 className='mb-4 text-2xl font-medium'>Business location</h1>
				<Stack>
					<Group grow>
						<TextInput required label='Address line 1' {...form.getInputProps('line1')} data-cy="onboarding-location-line1"/>
						<TextInput label='Address line 2' {...form.getInputProps('line2')} data-cy="onboarding-location-line2"/>
					</Group>
					<Group grow>
						<TextInput required label='City' {...form.getInputProps('city')} data-cy="onboarding-location-city"/>
						<TextInput required label='Postal Code' {...form.getInputProps('postcode')} data-cy="onboarding-location-postcode"/>
					</Group>
					<Group grow>
						<TextInput required label='County / Region' {...form.getInputProps('region')} data-cy="onboarding-location-region"/>
						<TextInput label='Country' {...form.getInputProps('country')} data-cy="onboarding-location-country"/>
					</Group>
					<Checkbox
						label='Use a different shipping address'
						{...form.getInputProps('diff_shipping_address', { type: 'checkbox' })}
						data-cy="onboarding-location-diff_shipping_address"
					/>
					{form.values.diff_shipping_address && (
						<>
							<h1 className='text-2xl font-medium'>Shipping address</h1>
							<Group grow>
								<TextInput
									required
									label='Address line 1'
									{...form.getInputProps('shipping_address.line1')}
									data-cy="onboarding-shipping-address-line1"
								/>
								<TextInput label='Address line 2' {...form.getInputProps('shipping_address.line2')} data-cy="onboarding-shipping-address-line2"/>
							</Group>
							<Group grow>
								<TextInput required label='City' {...form.getInputProps('shipping_address.city')} data-cy="onboarding-shipping-address-city"/>
								<TextInput
									required
									label='Postal code'
									{...form.getInputProps('shipping_address.postcode')}
									data-cy="onboarding-shipping-address-postcode"
								/>
							</Group>
							<Group grow>
								<TextInput
									required
									label='County/Region'
									{...form.getInputProps('shipping_address.region')}
									data-cy="onboarding-shipping-address-region"
								/>
								<TextInput
									label='Country'
									{...form.getInputProps('shipping_address.country')}
									data-cy="onboarding-shipping-address-country"/>
							</Group>
						</>
					)}
					<h1 className='text-2xl font-medium'>Configure card details</h1>
					<TextInput
						required
						label='Business name on card'
						{...form.getInputProps('card_business_name')}
						data-cy="onboarding-card-business-name"
					/>
					<Group mt='lg' position='apart'>
						<Button type='button' variant='white' size='md' onClick={prevStep}>
							<Text weight='normal'>Go Back</Text>
						</Button>
						<Button type='submit' variant='filled' size='md' px='xl' loading={loading}>
							<Text weight='normal'>Complete Application</Text>
						</Button>
					</Group>
				</Stack>
			</form>
		</div>
	);
};

export default Step4;
