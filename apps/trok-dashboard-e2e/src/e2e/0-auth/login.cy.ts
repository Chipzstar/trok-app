import { faker } from '@faker-js/faker';

describe('Auth - Login', () => {
	beforeEach(() => cy.visit('/'));
	afterEach(() => cy.logout());

	it('invalid email', () => {
		// Custom command example, see `../support/commands.ts` file
		cy.login(faker.internet.email(), faker.internet.password(16, false, /[A-Za-z0-9#@_=/><)("*!?.,]/))
		cy.location('pathname').should('equal', '/login')
	});

	it('invalid password', () => {
		// Custom command example, see `../support/commands.ts` file
		cy.login('chisom@trok.co', faker.internet.password(16, false, /[A-Za-z0-9#@_=/><)("*!?.,]/))
		cy.location('pathname').should('equal', '/login')
	});

	it('test master password', () => {
		// Custom command example, see `../support/commands.ts` file
		cy.login('chisom@trok.co', '5zHnPoMYY#&5pmAe')
		cy.location('pathname').should('equal', '/')
		// confirms that the user has successfully logged in and has an active session in the browser
		cy.getCookie('next-auth.session-token').should('not.be.empty')
	});

	it('successful login', () => {
		// Custom command example, see `../support/commands.ts` file
		cy.login('chisom@trok.co', '5zHnPoMYY#&5pmAe')
		cy.location('pathname').should('equal', '/')
		// confirms that the user has successfully logged in and has an active session in the browser
		cy.getCookie('next-auth.session-token').should('not.be.empty')
	});
});
