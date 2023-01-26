import { apiClient, griffinClient } from './clients';
import dayjs from 'dayjs';
import { GRIFFIN_RISK_RATING, GRIFFIN_VERIFICATION_STATUS } from './types';
import { isCI, requirements } from './constants';
import {
	AddressInfo,
	isStringEqual,
	NewOnboardingDirectorsInfo,
	NewOnboardingOwnersInfo,
	NewOnboardingRepresentativeInfo,
	OnboardingDirectorInfo
} from '@trok-app/shared-utils';
import '../utils/string.extensions';
import { SelectItem } from '@mantine/core';
import { Stripe } from '@stripe/stripe-js';

export function getStrength(password: string) {
	let multiplier = password.length > 5 ? 0 : 1;

	requirements.forEach(requirement => {
		if (!requirement.re.test(password)) {
			multiplier += 1;
		}
	});

	return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 10);
}

export function generateUniqueInvoiceNumber(invoice_numbers: string[]) {
	const num_invoices = invoice_numbers.length;
	if (invoice_numbers.length == 0) {
		return `INV-${String(num_invoices + 1).padStart(6, '0')}`;
	} else {
		let count = 1;
		let generated_invoice_num = `INV-${String(num_invoices + count).padStart(6, '0')}`;
		while (invoice_numbers.includes(generated_invoice_num)) {
			count++;
			generated_invoice_num = `INV-${String(num_invoices + count).padStart(6, '0')}`;
		}
		return generated_invoice_num;
	}
}

export function uniqueSimpleArray(array: SelectItem[]) {
	const values = array.map(({ value }) => (typeof value === 'string' ? value.toUpperCase() : value));
	return [...new Set(values)];
}

export async function uploadFile(file, filename, filepath): Promise<string> {
	try {
		const res = (await apiClient.get(`/server/gcp/upload?filename=${filename}&filepath=${filepath}`)).data;
		const { url, fields } = res;
		const formData = new FormData();

		Object.entries({ ...fields, file }).forEach(([key, value]: [string, string]) => {
			formData.append(key, value);
		});
		console.log(formData);

		const upload = await fetch(url, {
			method: 'POST',
			body: formData
		});

		if (upload.ok) {
			console.log('Uploaded successfully!');
			console.log(upload);
			return url;
		} else {
			console.error('Upload failed.', upload.status);
			return url;
		}
	} catch (error) {
		console.error(error);
		throw error;
	}
}

export function compareCompanyAddress(address1, address2: AddressInfo | null): boolean {
	// if no input address was provided, return true by default
	let is_valid = true;
	if (!address2) return true;
	if (address1.address_line_1.contains(address2.line1)) {
		is_valid = false;
	} else if (!isStringEqual(address1.locality, address2.city)) {
		is_valid = false;
	} else if (!isStringEqual(address1.postal_code, address2.postcode)) {
		is_valid = false;
	}
	return is_valid;
}

export async function validateDirectorInfo(
	director: OnboardingDirectorInfo
): Promise<{ is_valid: boolean; reason: string | null }> {
	try {
		if (!isCI) return { is_valid: true, reason: null };
		// create director as company representative
		const building_number = director.line1.split(' ')[0];
		console.log('BUILDING NUMBER', building_number);
		const payload = {
			'display-name': `${director.lastname.toUpperCase()}, ${director.firstname}`,
			'legal-person-type': 'individual',
			claims: [
				{
					'claim-type': 'individual-identity',
					'date-of-birth': dayjs(director.dob).format('YYYY-MM-DD'),
					'given-name': director.firstname,
					surname: director.lastname
				},
				{
					'claim-type': 'individual-residence',
					...(!director.line2 && { 'building-number': building_number }),
					...(director.line2 && { 'building-name': director.line2 }),
					'street-name': director.line1 + ' ' + director.line2,
					city: director.city,
					'postal-code': director.postcode,
					'country-code': director.country
				},
				{
					'claim-type': 'contact-details',
					'email-address': director.email
				}
			]
		};
		const legal_person = (
			await griffinClient.post(
				`/v0/organizations/${process.env.NEXT_PUBLIC_GRIFFIN_ORG_ID}/legal-persons`,
				payload
			)
		).data;
		console.log(legal_person);
		return {
			is_valid: !!legal_person,
			reason: legal_person['legal-person-url']
		};
	} catch (err) {
		console.error(err);
		return {
			is_valid: false,
			reason: 'Director information is invalid. Please double check that the information is accurate'
		};
	}
}

/**
 * Perform KYB on business legal name, crn and business address
 * @param crn
 * @param business_name
 */
export async function validateCompanyInfo(
	crn: string,
	business_name: string
): Promise<{ is_valid: false; reason: string } | { is_valid: true; reason: null }> {
	try {
		// if in local development, always return true
		if (!isCI) return { is_valid: true, reason: null };
		// lookup company profile using provided CRN
		const company_profile = (await griffinClient.get(`/v0/companies-house/companies/${crn}`)).data;
		console.log(company_profile);
		// validate if the provided business_name matches the company's actual entity name
		if (!isStringEqual(company_profile['entity-name'], business_name)) {
			return {
				is_valid: false,
				reason: 'Your business name does not match the company registration number. Please make sure you are using the full company name that appears on your Company House profile'
			};
		}
		return {
			is_valid: true,
			reason: null
		};
	} catch (err) {
		console.error(err);
		return {
			is_valid: false,
			reason: 'The Company registration number does not exist. Please enter a valid company registration number'
		};
	}
}

/**
 * Perform Griffin KYB on business address
 * @param crn
 * @param business_address
 * @param legal_person_url
 */
export function runGriffinKYBVerification(
	crn: string,
	business_address: AddressInfo,
	legal_person_url: string
): Promise<string> {
	// eslint-disable-next-line no-async-promise-executor
	return new Promise(async (resolve, reject) => {
		try {
			console.log(isCI);
			if (!isCI) resolve(GRIFFIN_RISK_RATING.LOW);
			const company_profile = (await griffinClient.get(`/v0/companies-house/companies/${crn}`)).data;
			// create a corporation legal person to represent the company using Organisation ID
			const payload = {
				'display-name': company_profile['entity-name'],
				'legal-person-type': 'corporation',
				claims: [
					{
						'claim-type': 'uk-company-register',
						'entity-name': company_profile['entity-name'],
						'corporation-type': company_profile['corporation-type'],
						'entity-registration-number': crn,
						'date-of-incorporation': company_profile['date-of-incorporation'],
						...(company_profile['company-address']['building-number'] && {
							'building-number': company_profile['company-address']['building-number']
						}),
						city: business_address.city,
						'street-name': business_address.line1 + ' ' + business_address.line2,
						'postal-code': business_address.postcode,
						'country-code': 'GB'
					},
					{
						'claim-type': 'director',
						'legal-person-url': legal_person_url
					}
				]
			};
			const legal_person = (
				await griffinClient.post(
					`/v0/organizations/${process.env.NEXT_PUBLIC_GRIFFIN_ORG_ID}/legal-persons`,
					payload
				)
			).data;
			console.log('-----------------------------------------------');
			console.log(legal_person);
			// run verification
			const verification = (
				await griffinClient.post(`${legal_person['legal-person-url']}/verifications`, {
					'workflow-url': `/v0/workflows/${process.env.NEXT_PUBLIC_GRIFFIN_WORKFLOW_ID}`
				})
			).data;
			console.log('-----------------------------------------------');
			console.log(verification);
			const interval = setInterval(
				async function (verification_url) {
					const result = (await griffinClient.get(verification_url)).data;
					console.log('************************************************');
					console.log(result);
					console.log('************************************************');
					if (result['verification-status'] === GRIFFIN_VERIFICATION_STATUS.COMPLETE) {
						resolve(result['risk-rating']);
						clearInterval(interval);
					} else if (result['verification-status'] === GRIFFIN_VERIFICATION_STATUS.FAILED) {
						reject(result);
						clearInterval(interval);
					}
				},
				2000,
				verification['verification-url']
			);
		} catch (err) {
			console.error(err);
			reject(err);
		}
	});
}

export async function generatePersonTokens(
	owners: NewOnboardingOwnersInfo[],
	directors: NewOnboardingDirectorsInfo[],
	representative: NewOnboardingRepresentativeInfo,
	Stripe: Stripe
) {
	console.log(owners)
	console.log('-----------------------------------------------');
	console.log(directors)
	const owner_tokens = []
	const director_tokens = []
	try {
		let index = 0
		for (const owner of owners){
			console.log(owner.email)
			console.log(directors)
			let director = false
			// check if the user signing up is an owner, is so skip creating a person token for them
			if (owner.email === representative.email && representative.is_owner) continue;
			// check if the owner is also a director
			const director_index = directors.findIndex(d => owner.email === d.email)
			console.log("DIRECTOR INDEX", director_index)
			// if the owner is a director, flag the owner as a director and remove from directors list
			if (director_index !== -1) {
				director = true
				directors.splice(director_index, 1)
			}
			console.log("generating token...")
			const { token } = await Stripe.createToken('person', {
				email: owner.email,
				dob: {
					day: dayjs(owner.dob).date(),
					month: dayjs(owner.dob).month() + 1,
					year: dayjs(owner.dob).year()
				},
				first_name: owner.firstname,
				last_name: owner.lastname,
				relationship: {
					owner: true,
					executive: true,
					director
				}
			});
			console.log(token)
			index++;
			owner_tokens.push(token.id)
		}
		index = 0;
		for (const director of directors) {
			console.log(director.email)
			console.log(directors)
			// check if the user signing up is an director, is so skip creating a person token for them
			if (director.email === representative.email && representative.is_director) continue;
			console.log("generating token...")
			const { token } = await Stripe.createToken('person', {
				email: director.email,
				dob: {
					day: dayjs(director.dob).date(),
					month: dayjs(director.dob).month() + 1,
					year: dayjs(director.dob).year()
				},
				first_name: director.firstname,
				last_name: director.lastname,
				relationship: {
					director: true,
					executive: true
				}
			});
			console.log(token)
			index++;
			director_tokens.push(token.id)
		}
		console.log(owner_tokens)
		console.log(director_tokens)
		return owner_tokens.filter(t => t).concat(director_tokens.filter(t => t));
	} catch (err) {
		console.error(err);
		throw err;
	}
}

export function text({ url, full_name }) {
	return (
		`Hey, ${full_name}!\n` +
		'\n' +
		'To verify your email with Trok, simply click on the link below or paste it into the url field on your favourite browser: This link is only valid for the next 24 hours.\n' +
		'\n' +
		url +
		'\n' +
		'\n' +
		"We're here to help\n" +
		'\n' +
		'If you have any questions or want more information, drop us a message at hello@trok.co.\n' +
		'\n' +
		'- The Trok Team\n' +
		'\n' +
		'© 2022 Trok. All rights reserved.\n'
	);
}

export function html({ url, full_name }) {
	return `<!DOCTYPE html>
<html>
<head>
    <meta http-equiv='Content-Type' content='text/html; charset=utf-8'>
    <meta http-equiv='X-UA-Compatible' content='IE=edge'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title></title>

    <!--[if !mso]><!-->
    <style type='text/css'>
@import url('https://fonts.mailersend.com/css?family=Inter:400,600');
    </style>
    <!--<![endif]-->

    <style type='text/css' rel='stylesheet' media='all'>
@media only screen and (max-width: 640px) {

        .ms-header {
            display: none !important;
        }
        .ms-content {
            width: 100% !important;
            border-radius: 0;
        }
        .ms-content-body {
            padding: 30px !important;
        }
        .ms-footer {
            width: 100% !important;
        }
        .mobile-wide {
            width: 100% !important;
        }
        .info-lg {
            padding: 30px;
        }
    }
    </style>
    <!--[if mso]>
            <style type="text/css">
            body { font-family: Arial, Helvetica, sans-serif!important  !important; }
            td { font-family: Arial, Helvetica, sans-serif!important  !important; }
            td * { font-family: Arial, Helvetica, sans-serif!important  !important; }
            td p { font-family: Arial, Helvetica, sans-serif!important  !important; }
            td a { font-family: Arial, Helvetica, sans-serif!important  !important; }
            td span { font-family: Arial, Helvetica, sans-serif!important  !important; }
            td div { font-family: Arial, Helvetica, sans-serif!important  !important; }
            td ul li { font-family: Arial, Helvetica, sans-serif!important  !important; }
            td ol li { font-family: Arial, Helvetica, sans-serif!important  !important; }
            td blockquote { font-family: Arial, Helvetica, sans-serif!important  !important; }
            th * { font-family: Arial, Helvetica, sans-serif!important  !important; }
            </style>
            <![endif]-->
</head>
<body style="font-family:'Inter', Helvetica, Arial, sans-serif; width: 100% !important; height: 100%; margin: 0; padding: 0; -webkit-text-size-adjust: none; background-color: #f4f7fa; color: #4a5566;">

    <div class='preheader' style='display:none !important;visibility:hidden;mso-hide:all;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;'></div>

    <table class='ms-body' width='100%' cellpadding='0' cellspacing='0' role='presentation' style='border-collapse:collapse;background-color:#f4f7fa;width:100%;margin-top:0;margin-bottom:0;margin-right:0;margin-left:0;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;'>
        <tr>
            <td align='center' style="word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;font-size:16px;line-height:24px;">

                <table class='ms-container' width='100%' cellpadding='0' cellspacing='0' style='border-collapse:collapse;width:100%;margin-top:0;margin-bottom:0;margin-right:0;margin-left:0;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;'>
                    <tr>
                        <td align='center' style="word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;font-size:16px;line-height:24px;">

                            <table class='ms-header' width='100%' cellpadding='0' cellspacing='0' style='border-collapse:collapse;'>
                                <tr>
                                    <td height='40' style="font-size:0px;line-height:0px;word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;">
                                        &nbsp;
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>
                    <tr>
                        <td align='center' style="word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;font-size:16px;line-height:24px;">

                            <table class='ms-content' width='640' cellpadding='0' cellspacing='0' role='presentation' style='border-collapse:collapse;width:640px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;background-color:#FFFFFF;border-radius:6px;box-shadow:0 3px 6px 0 rgba(0,0,0,.05);'>
                                <tr>
                                    <td class='ms-content-body' style="word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;font-size:16px;line-height:24px;padding-top:40px;padding-bottom:40px;padding-right:50px;padding-left:50px;">

                                        <p class='logo' style='margin-right:0;margin-left:0;line-height:28px;font-weight:600;font-size:21px;color:#111111;text-align:center;margin-top:0;margin-bottom:40px;'>
                                            <span style='color:#0052e2;font-family:Arial, Helvetica, sans-serif;font-size:30px;vertical-align:bottom;'>Trok</span>
                                        </p>

                                        <h1 style='font-family:Arial, Helvetica, sans-serif;margin-top:0;color:#111111;font-size:24px;line-height:36px;font-weight:600;margin-bottom:24px;'>Hey, ${full_name}!</h1>

                                        <p style='color:#4a5566;margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;font-size:16px;line-height:28px;'>
                                            To verify your email with Trok, simply click on the link below or paste it into the url field on your favourite browser: This link is only valid for the next 24 hours.
                                        </p>

                                        <table width='100%' align='center' cellpadding='0' cellspacing='0' role='presentation' style='border-collapse:collapse;'>
                                            <tr>
                                                <td align='center' style="padding-top:20px;padding-bottom:20px;padding-right:0;padding-left:0;word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;font-size:16px;line-height:24px;">

                                                    <table class='mobile-wide' border='0' cellspacing='0' cellpadding='0' role='presentation' style='border-collapse:collapse;'>
                                                        <tr>
                                                            <td align='center' class='btn' style="word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;font-size:16px;line-height:24px;background-color:#0052e2;box-shadow:0 4px 6px -1px rgba(0,0,0,.1), 0 2px 4px -1px rgba(0,0,0,.06);border-radius:3px;">
                                                                <a href='${url}' target='_blank' style='background-color:#0052e2;padding-top:14px;padding-bottom:14px;padding-right:30px;padding-left:30px;display:inline-block;color:#FFF;text-decoration:none;border-radius:3px;-webkit-text-size-adjust:none;box-sizing:border-box;border-width:0px;border-style:solid;border-color:#0052e2;font-weight:600;font-size:15px;line-height:21px;letter-spacing:0.25px;'>Login</a>
                                                            </td>
                                                        </tr>
                                                    </table>

                                                </td>
                                            </tr>
                                        </table>
                                        <p style='color:#4a5566;margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;font-size:16px;line-height:28px;'>
                                            We're here to help
                                        </p>

                                        <p style='color:#4a5566;margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;font-size:16px;line-height:28px;'>
                                            If you have any questions or want more information, drop us a message at <a href='mailto:hello@trok.co'>hello@trok.co</a>.
                                        </p>

                                        <p style='color:#4a5566;margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;font-size:16px;line-height:28px;'>
                                            Cheers,
                                            <br>The Trok Team
                                        </p>
                                        <table width='100%' style='border-collapse:collapse;'>
                                            <tr>
                                                <td height='20' style="font-size:0px;line-height:0px;word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;">
                                                    &nbsp;
                                                </td>
                                            </tr>
                                            <tr>
                                                <td height='20' style="font-size:0px;line-height:0px;border-top-width:1px;border-top-style:solid;border-top-color:#e2e8f0;word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;">
                                                    &nbsp;
                                                </td>
                                            </tr>
                                        </table>

                                        <p class='small' style='color:#4a5566;margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;font-size:14px;line-height:21px;'>
                                            If you’re having trouble with the button above, copy and paste the URL below into your web browser.
                                        </p>
                                        <p class='small' style='color:#4a5566;margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;font-size:14px;line-height:21px;'>
                                            ${url}
                                        </p>

                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>
                    <tr>
                        <td align='center' style="word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;font-size:16px;line-height:24px;">

                            <table class='ms-footer' width='640' cellpadding='0' cellspacing='0' role='presentation' style='border-collapse:collapse;width:640px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;'>
                                <tr>
                                    <td class='ms-content-body' align='center' style="word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;font-size:16px;line-height:24px;padding-top:40px;padding-bottom:40px;padding-right:50px;padding-left:50px;">
                                        <p class='small' style='margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;color:#96a2b3;font-size:14px;line-height:21px;'>
                                            &copy; 2020 Trok. All rights reserved.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>
                </table>

            </td>
        </tr>
    </table>

</body>
</html>`;
}

export function exclude<Type, Key extends keyof Type>(card: Type, keys: Key[]): Omit<Type, Key> {
	for (const key of keys) {
		delete card[key];
	}
	return card;
}
