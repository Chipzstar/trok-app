import { faker } from '@faker-js/faker';
import { genReferralCode } from '@trok-app/shared-utils';

const firstname = faker.name.firstName();
const lastname = faker.name.lastName();
const email = faker.internet.email(firstname, lastname);
describe('Auth - Signup', () => {
	beforeEach(() => cy.visit('/signup').url().should('contain', '/signup'));

	it('duplicate email', () => {
		cy.signup({
			firstname,
			lastname,
			email: 'chisom@trok.co',
			phone: faker.phone.number('+44 75# ### ####'),
			password: faker.internet.password(25, false, /[A-Za-z0-9#@_=/><)("*!?.,]/),
			full_name: `${firstname} ${lastname}`,
			referral_code: genReferralCode(),
			terms: true
		});
		cy.location('pathname').should('contain', '/signup');
	});

	it('invalid referral code', () => {
		cy.signup({
			firstname,
			lastname,
			email,
			phone: faker.phone.number('+44 75# ### ####'),
			password: faker.internet.password(25, false, /[A-Za-z0-9#@_=/><)("*!?.,]/),
			full_name: `${firstname} ${lastname}`,
			referral_code: genReferralCode(),
			terms: true
		});
		cy.location('pathname').should('contain', '/signup');
	});

	it('insecure password', () => {
		cy.signup({
			firstname,
			lastname,
			email,
			phone: faker.phone.number('+44 75# ### ####'),
			password: faker.internet.password(20, false, /[A-Za-z#@_=/><)("*!?.,]/),
			full_name: `${firstname} ${lastname}`,
			referral_code: genReferralCode(),
			terms: true
		});
		cy.location('pathname').should('contain', '/signup');
	});

	it('successful signup', () => {
		cy.signup({
			firstname,
			lastname,
			email,
			phone: faker.phone.number('+44 75# ### ####'),
			password: faker.internet.password(25, false, /[A-Za-z0-9#@_=/><)("*!?.,]/),
			full_name: `${firstname} ${lastname}`,
			terms: true
		});
		cy.location('pathname').should('contain', '/onboarding');
	});

	it('successful signup with referral code', () => {
		cy.signup({
			firstname,
			lastname,
			email,
			phone: faker.phone.number('+44 75# ### ####'),
			password: faker.internet.password(25, false, /[A-Za-z0-9#@_=/><)("*!?.,]/),
			full_name: `${firstname} ${lastname}`,
			referral_code: "EaQdpdJWVgRhYvV6",
			terms: true
		});
		cy.location('pathname').should('contain', '/onboarding');
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
});