describe.skip('trok-dashboard', () => {
	beforeEach(() => cy.visit('/'));

	it('successful login', () => {
		// Custom command example, see `../support/commands.ts` file
		cy.log('env', Cypress.env())
	});
});
