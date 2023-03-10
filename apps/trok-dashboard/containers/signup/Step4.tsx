import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from '@mantine/form';
import { Button, Checkbox, Group, Stack, Text, TextInput } from '@mantine/core';
import { PATHS, STORAGE_KEYS, STRIPE_PUBLIC_KEY } from '../../utils/constants';
import { useLocalStorage } from '@mantine/hooks';
import { loadStripe } from '@stripe/stripe-js';
import {
	AddressInfo,
	CreateUser,
	getE164Number,
	isValidUrl,
	notifyError,
	OnboardingAccountStep3,
	OnboardingBusinessInfo,
	OnboardingDirectorInfo,
	OnboardingFinancialInfo,
	OnboardingLocationInfo,
	SignupInfo
} from '@trok-app/shared-utils';
import { IconX } from '@tabler/icons';
import { apiClient } from '../../utils/clients';
import { useRouter } from 'next/router';
import { runGriffinKYBVerification, validateCompanyInfo } from '../../utils/functions';
import dayjs from 'dayjs';
import { GRIFFIN_RISK_RATING } from '../../utils/types';

const Stripe = await loadStripe(String(STRIPE_PUBLIC_KEY));

const Step4 = ({ prevStep }) => {
	const router = useRouter();
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
	const [directorObj, setDirector] = useLocalStorage<OnboardingDirectorInfo>({ key: STORAGE_KEYS.DIRECTORS_FORM });
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
				const risk_rating = await runGriffinKYBVerification(
					businessObj.business_crn,
					location,
					griffin.legal_person_url
				);
				if (risk_rating === GRIFFIN_RISK_RATING.HIGH)
					throw new Error(
						'We have detected a high risk of fraud based on your responses. We advise you check your responses carefully and try submitting again'
					);
				// convert phone number to E164 format
				personalObj.phone = getE164Number(personalObj.phone);
				console.log(directorObj);
				const personResult = await Stripe.createToken('person', {
					dob: {
						day: dayjs(directorObj.dob).date(),
						month: dayjs(directorObj.dob).month() + 1,
						year: dayjs(directorObj.dob).year()
					},
					address: {
						line1: directorObj.line1,
						line2: directorObj.line2,
						city: directorObj.city,
						state: directorObj.region,
						postal_code: directorObj.postcode,
						country: directorObj.country
					},
					relationship: {
						owner: true,
						director: true,
						executive: true,
						representative: true
					},
					first_name: directorObj.firstname,
					last_name: directorObj.lastname,
					email: directorObj.email,
					phone: personalObj.phone
				});
				if (personResult.error) throw new Error(personResult.error.message);
				// generate secure tokens to create account + person in stripe
				const accountResult = await Stripe.createToken('account', {
					business_type: 'company',
					company: {
						name: businessObj.legal_name,
						phone: personalObj.phone,
						address: {
							line1: values.line1,
							line2: values.line2,
							city: values.city,
							state: values.region,
							postal_code: values.postcode,
							country: 'GB'
						},
						tax_id: businessObj.business_crn,
						structure: businessObj.business_type,
						owners_provided: true,
						directors_provided: true,
						executives_provided: true
					},
					tos_shown_and_accepted: true
				});
				if (accountResult.error) throw new Error(accountResult.error.message);
				const isUrlValid = isValidUrl(businessObj.business_url);
				const payload: CreateUser = {
					...account,
					shipping_address: values.diff_shipping_address ? values.shipping_address : location,
					location,
					card_configuration: {
						card_business_name: values.card_business_name,
						num_cards: values.num_cards,
						shipping_speed: values.shipping_speed
					}
				};
				await apiClient.post('/server/auth/complete-registration', {
					accountToken: accountResult.token,
					personToken: personResult.token,
					business_profile: {
						support_email: personalObj.email,
						mcc: businessObj.merchant_category_code,
						url: isUrlValid ? businessObj.business_url : undefined,
						product_description: !isUrlValid ? businessObj.business_url : undefined
					},
					data: payload
				});
				setLoading(false);
				router.push(PATHS.VERIFY_EMAIL);
			} catch (err) {
				setLoading(false);
				console.error(err);
				notifyError('onboarding-step3-failure', err?.error?.message ?? err.message, <IconX size={20} />);
			}
		},
		[account, griffin, personalObj, businessObj, directorObj, financialObj]
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
			<form onSubmit={form.onSubmit(handleSubmit)} className='flex h-full w-full flex-col'>
				<h1 className='mb-4 text-2xl font-medium'>Business location</h1>
				<Stack>
					<Group grow>
						<TextInput required label='Address line 1' {...form.getInputProps('line1')} />
						<TextInput label='Address line 2' {...form.getInputProps('line2')} />
					</Group>
					<Group grow>
						<TextInput required label='City' {...form.getInputProps('city')} />
						<TextInput required label='Postal Code' {...form.getInputProps('postcode')} />
					</Group>
					<Group grow>
						<TextInput required label='County / Region' {...form.getInputProps('region')} />
						<TextInput label='Country' {...form.getInputProps('country')} />
					</Group>
					<Checkbox
						label='Use a different shipping address'
						{...form.getInputProps('diff_shipping_address', { type: 'checkbox' })}
					/>
					{form.values.diff_shipping_address && (
						<>
							<h1 className='text-2xl font-medium'>Shipping address</h1>
							<Group grow>
								<TextInput
									required
									label='Address line 1'
									{...form.getInputProps('shipping_address.line1')}
								/>
								<TextInput label='Address line 2' {...form.getInputProps('shipping_address.line2')} />
							</Group>
							<Group grow>
								<TextInput required label='City' {...form.getInputProps('shipping_address.city')} />
								<TextInput
									required
									label='Postal code'
									{...form.getInputProps('shipping_address.postcode')}
								/>
							</Group>
							<Group grow>
								<TextInput
									required
									label='County/Region'
									{...form.getInputProps('shipping_address.region')}
								/>
								<TextInput label='Country' {...form.getInputProps('shipping_address.country')} />
							</Group>
						</>
					)}
					<h1 className='text-2xl font-medium'>Configure card details</h1>
					<TextInput
						required
						label='Business name on card'
						{...form.getInputProps('card_business_name')}
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
