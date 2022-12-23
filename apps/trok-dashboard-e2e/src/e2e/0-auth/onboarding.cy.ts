import { faker } from '@faker-js/faker';

const firstname = faker.name.firstName();
const lastname = faker.name.lastName();
const email = faker.internet.email(firstname, lastname);

describe('Auth - Onboarding', () => {
	beforeEach(() => {
		cy.visit('/signup')
		cy.signup({
			firstname,
			lastname,
			email,
			phone: faker.phone.number('+44 75# ### ####'),
			password: "#" + faker.internet.password(25, false, /[A-Za-z0-9#@_=/><)("*!?.,]/),
			full_name: `${firstname} ${lastname}`,
			terms: true
		});
		cy.location('pathname').should('contain', '/onboarding');
	});

	it('invalid CRN', () => {
		cy.onboardingStep1({
			business_crn: faker.random.numeric(8),
			legal_name: "SECONDS TECHNOLOGIES LTD",
			business_type: "private_company",
			business_url: "https://useseconds.com",
			num_vehicles: 10,
			merchant_category_code: "4214",
			weekly_fuel_spend: 200000
		})
		cy.location('pathname').should('contain', '/onboarding');
		cy.get('.mantine-Notification-description').should('be.visible')
	});

	it('missing driving license', () => {
		cy.onboardingStep1({
			business_crn: "13504612",
			legal_name: "SECONDS TECHNOLOGIES LTD",
			business_type: "private_company",
			business_url: "https://useseconds.com",
			num_vehicles: 10,
			merchant_category_code: "4214",
			weekly_fuel_spend: 200000
		})
		cy.location('pathname').should('contain', '/onboarding');
		cy.get('.mantine-Notification-description').should('have.text', "Please upload a picture of your driver's license before submitting")
	});

	it('complete onboarding step1', () => {
		cy.onboardingStep1({
			business_crn: "13504612",
			legal_name: "SECONDS TECHNOLOGIES LTD",
			business_type: "private_company",
			business_url: "https://useseconds.com",
			num_vehicles: 10,
			merchant_category_code: "4214",
			weekly_fuel_spend: 200000
		}, true)
		cy.location('pathname').should('equal', '/onboarding');
		cy.location('search').should('equal', '?page=2');
	});

	it('complete onboarding step2', () => {
		cy.onboardingStep1({
			business_crn: "13504612",
			legal_name: "SECONDS TECHNOLOGIES LTD",
			business_type: "private_company",
			business_url: "https://useseconds.com",
			num_vehicles: 10,
			merchant_category_code: "4214",
			weekly_fuel_spend: 200000
		}, true)
		cy.location('pathname').should('equal', '/onboarding');
		cy.location('search').should('equal', '?page=2');
		cy.onboardingStep2({
			firstname,
			lastname,
            email,
			dob: faker.date.birthdate({
				min: 13,
				max: 75
			}).toDateString(),
			line1: faker.address.streetName(),
			city: faker.address.city(),
			postcode: faker.address.zipCode(),
			region: faker.address.county(),
			country: "England",
		})
		cy.location('pathname').should('equal', '/onboarding');
		cy.location('search').should('equal', '?page=3');
	});

	it('complete onboarding step3', () => {
		cy.onboardingStep1({
			business_crn: "13504612",
			legal_name: "SECONDS TECHNOLOGIES LTD",
			business_type: "private_company",
			business_url: "https://useseconds.com",
			num_vehicles: 10,
			merchant_category_code: "4214",
			weekly_fuel_spend: 200000
		}, true)
		cy.location('pathname').should('equal', '/onboarding');
		cy.location('search').should('equal', '?page=2');
		cy.onboardingStep2({
			firstname,
			lastname,
			email,
			dob: faker.date.birthdate({
				min: 13,
				max: 75
			}).toDateString(),
			line1: faker.address.streetName(),
			city: faker.address.city(),
			postcode: faker.address.zipCode(),
			region: faker.address.county(),
			country: "England",
		})
		cy.location('pathname').should('equal', '/onboarding');
		cy.location('search').should('equal', '?page=3');
		cy.onboardingStep3({
			average_monthly_revenue: 600000
		})
		cy.location('pathname').should('equal', '/onboarding');
		cy.location('search').should('equal', '?page=4');
	})

	it('Special characters in card business name', () => {
		cy.visit('/onboarding?page=4').location('search').should('equal', '?page=4')
		cy.onboardingStep4({
			line1: "35 Forresters Apartments",
			line2: "42 Linton Road",
			city: "Barking",
			postcode: "IG11 8FS",
			region: "Essex",
			country: "England",
			card_business_name: "Seconds Technologies #",
			diff_shipping_address: false,
			num_cards: 10,
			shipping_speed: "standard"
		})
	})

	it('Business card name exceeds 24 characters', () => {
		cy.visit('/onboarding?page=4').location('search').should('equal', '?page=4')
		cy.onboardingStep4({
			line1: "35 Forresters Apartments",
			line2: "42 Linton Road",
			city: "Barking",
			postcode: "IG11 8FS",
			region: "Essex",
			country: "England",
			card_business_name: "Seconds Technologies Limited",
			diff_shipping_address: false,
			num_cards: 10,
			shipping_speed: "standard",
		})
		cy.location('search').should('equal', '?page=4')
	})

	it('complete onboarding final step', () => {
		cy.onboardingStep1({
			business_crn: "13504612",
			legal_name: "SECONDS TECHNOLOGIES LTD",
			business_type: "private_company",
			business_url: "https://useseconds.com",
			num_vehicles: 10,
			merchant_category_code: "4214",
			weekly_fuel_spend: 200000
		}, true)
		cy.location('pathname').should('equal', '/onboarding');
		cy.location('search').should('equal', '?page=2');
		cy.onboardingStep2({
			firstname,
			lastname,
			email,
			dob: faker.date.birthdate({
				min: 13,
				max: 75
			}).toDateString(),
			line1: faker.address.streetName(),
			city: faker.address.city(),
			postcode: faker.address.zipCode(),
			region: faker.address.county(),
			country: "England",
		})
		cy.location('pathname').should('equal', '/onboarding');
		cy.location('search').should('equal', '?page=3');
		cy.onboardingStep3({
			average_monthly_revenue: 600000
		})
		cy.location('pathname').should('equal', '/onboarding');
		cy.location('search').should('equal', '?page=4');
		cy.onboardingStep4({
			line1: "35 Forresters Apartments",
			line2: "42 Linton Road",
			city: "Barking",
			postcode: "IG11 8FS",
			region: "Essex",
            country: "England",
			card_business_name: "Seconds Technologies Ltd",
			diff_shipping_address: false,
			num_cards: 10,
			shipping_speed: "standard",
		}, 15000)
	})

	after(() => {
		cy.request({
			url: `${Cypress.env('API_BASE_URL')}/server/trpc/removeRedisSignup`,
			method: 'POST',
			body: { email },
			headers: {
				Authorization: Cypress.env('ADMIN_USER_ID'),
			}
		}).then(r => console.log(r));
		cy.request({
			url: `${Cypress.env('API_BASE_URL')}/server/trpc/deleteUser`,
			method: 'POST',
			body: { email },
			headers: {
				Authorization: Cypress.env('ADMIN_USER_ID'),
			}
		}).then(r => console.log(r));
	});
})