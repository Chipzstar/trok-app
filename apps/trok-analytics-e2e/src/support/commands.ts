// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	interface Chainable<Subject> {
		login(email: string, password: string): void;
	}
}
//
// -- This is a parent command --
Cypress.Commands.add('login', (email, password) => {
	cy.log("Logging in...")
	cy.get('[data-cy="login-form"]').within(function () {
		cy.get('input[data-cy="login-email"]').type(email);
		cy.get('input[data-cy="login-password"]').type(password);
		cy.root().submit().wait(5000).url().should('equal', Cypress.env('BASE_URL'));
	});
});
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
