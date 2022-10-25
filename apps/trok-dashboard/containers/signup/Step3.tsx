import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from '@mantine/form';
import { Button, Checkbox, Group, Loader, NumberInput, Radio, Stack, Text, TextInput } from '@mantine/core';
import { phoneUtil, STORAGE_KEYS, STRIPE_PUBLIC_KEY } from '../../utils/constants';
import { useLocalStorage } from '@mantine/hooks';
import { loadStripe } from '@stripe/stripe-js';
import {
	CreateUser,
	isValidUrl,
	notifyError,
	OnboardingBusinessInfo,
	OnboardingFinancialInfo,
	OnboardingLocationInfo,
	SignupInfo
} from '@trok-app/shared-utils';
import { IconX } from '@tabler/icons';
import { PhoneNumberFormat as PNF } from 'google-libphonenumber';
import { apiClient } from '../../utils/clients';

const Stripe = await loadStripe(String(STRIPE_PUBLIC_KEY));

const Step3 = ({ prevStep, finish }) => {
	const [loading, setLoading] = useState(false);
	const [account, setAccount] = useLocalStorage<SignupInfo & Record<"business", OnboardingBusinessInfo>>({key: STORAGE_KEYS.ACCOUNT, defaultValue: null})
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
			country: 'GB',
			card_business_name: '',
			num_cards: null,
			shipping_speed: "standard",
			diff_shipping_address: false,
			shipping_address: {
				line1: '',
				line2: '',
				city: '',
				postcode: '',
				region: '',
				country: 'GB'
			}
		}
	});
	const form = useForm<OnboardingLocationInfo>({
		initialValues: {
			...locationForm
		}
	});

	const handleSubmit = useCallback(
		async (values: OnboardingLocationInfo) => {
			setLoading(true);
			console.log(values);
			try {
				// convert phone number to E164 format
				const phone = phoneUtil.parseAndKeepRawInput(personalObj.phone, 'GB');
				if (phoneUtil.getRegionCodeForNumber(phone) === 'GB') {
					personalObj.phone = phoneUtil.format(phone, PNF.E164);
				}
				const personResult = await Stripe.createToken('person', {
					...(values.diff_shipping_address && {
						address: {
							line1: values.shipping_address.line1,
							line2: values.shipping_address.line2,
							city: values.shipping_address.city,
							state: values.shipping_address.region,
							postal_code: values.shipping_address.postcode,
							country: values.shipping_address.country
						}
					}),
					relationship: {
						director: true,
						executive: true,
						representative: true
					},
					first_name: personalObj.firstname,
					last_name: personalObj.lastname,
					email: personalObj.email,
					phone: personalObj.phone
				});
				console.log('Person', personResult);
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
							country: values.country
						},
						tax_id: businessObj.business_crn,
						structure: businessObj.business_type,
						owners_provided: true,
						directors_provided: true,
						executives_provided: true
					},
					tos_shown_and_accepted: true
				});
				console.log('Account', accountResult);
				if (accountResult.error) {
					throw new Error(accountResult.error.message);
				}
				const isUrlValid = isValidUrl(businessObj.business_url);
				const location = {
					line1: values.line1,
					line2: values?.line2,
					city: values.city,
					postcode: values.postcode,
					region: values.region,
					country: values.country
				}
				const payload: CreateUser = {
					...personalObj,
					shipping_address: values.diff_shipping_address ? values.shipping_address : location,
					business: { ...businessObj, ...financialObj },
					location,
					card_configuration: {
						card_business_name: values.card_business_name,
						num_cards: values.num_cards,
						shipping_speed: values.shipping_speed
					},
					full_name: `${personalObj.firstname} ${personalObj.lastname}`
				}
				const user = (
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
					})
				).data;
				console.log('************************************************');
				console.log("USER:", user);
				console.log('************************************************');
				setLoading(false);
				finish(true);
			} catch (err) {
				setLoading(false);
				console.error(err);
				notifyError('onboarding-step1-failure', err.message, <IconX size={20} />);
			}
		},
		[personalObj, businessObj, financialObj, finish]
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
				<h1 className='mb-4 text-2xl font-medium'>Your location</h1>
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
						<TextInput readOnly label='Country' {...form.getInputProps('country')} />
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
								<TextInput
									readOnly
									label='Country'
									{...form.getInputProps('shipping_address.country')}
								/>
							</Group>
						</>
					)}
					<h1 className='text-2xl font-medium'>Configure card details</h1>
					<TextInput required label='Business name on card' {...form.getInputProps('card_business_name')} />
					<NumberInput
						min={1}
						max={50}
						required
						label='Number of cards'
						{...form.getInputProps('num_cards')}
					/>
					<Radio.Group
						spacing='xs'
						name='Shipping Speed'
						orientation='vertical'
						label='Select shipping speed'
						withAsterisk
						{...form.getInputProps('shipping_speed')}
					>
						<Radio value="standard" label='3-8 days. Cards left at address' />
						<Radio value="express" label='2-3 days. Cards left at address' />
						<Radio value="priority" label='2-3 days. Signature required at delivery' />
					</Radio.Group>
					<Group mt='lg' position='apart'>
						<Button type='button' variant='white' size='md' onClick={prevStep}>
							<Text weight='normal'>Go Back</Text>
						</Button>
						<Button type='submit' variant='filled' size='md' px='xl'>
							<Loader size='sm' className={`mr-3 ${!loading && 'hidden'}`} color='white' />
							<Text weight='normal'>Complete Application</Text>
						</Button>
					</Group>
				</Stack>
			</form>
		</div>
	);
};

export default Step3;
