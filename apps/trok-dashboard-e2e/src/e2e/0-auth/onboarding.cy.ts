describe.skip('Auth - Onboarding', () => {
	beforeEach(() => cy.visit('/'));

	it('navigate to signup page', () => {
		cy.visit('/onboarding').url().should('contain', '/onboarding')
	})
})