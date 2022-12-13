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

	after(() => {
		cy.request({
			url: `${Cypress.env('API_BASE_URL')}/server/trpc/removeRedisSignup`,
			method: 'POST',
			body: { email },
			headers: {
				Authorization: '6351316e230c0984c3d06ed0'
			}
		}).then(r => console.log(r));
	});
})