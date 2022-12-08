describe('Auth - Login', () => {
	beforeEach(() => cy.visit('/'));
	afterEach(() => cy.logout());

	it('successful login', () => {
		// Custom command example, see `../support/commands.ts` file
		cy.login('chisom@trok.co', '5zHnPoMYY#&5pmAe')
		cy.wait(3000).url().should('contain', Cypress.env('BASE_URL'))
		// confirms that the user has successfully logged in and has an active session in the browser
		cy.getCookie('next-auth.session-token').should('not.be.empty')
	});
});
