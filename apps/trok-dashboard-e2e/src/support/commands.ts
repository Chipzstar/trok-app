// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

import { SignupInfo } from '@trok-app/shared-utils';

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace Cypress {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		interface Chainable<Subject> {
			login(email: string, password: string): void;
			logout(): void;
			signup(values: SignupInfo): void;
		}
	}
}
//
// -- This is a parent command --
Cypress.Commands.addAll({
	login(email, password) {
		cy.log('Logging in...');
		cy.get('[data-cy="login-form"]').within(function () {
			cy.get('input[data-cy="login-email"]').type(email);
			cy.get('input[data-cy="login-password"]').type(password);
			cy.root().submit();
		});
	},
	logout() {
		cy.log('Logging out...');
		cy.get('[data-cy="logout-button"]').click()
	}
});
Cypress.Commands.add('signup', (values) => {
	cy.log('Signing up...');
	cy.get('[data-cy="signup-form"]').within(function () {
		cy.get('input[data-cy="signup-firstname"]').type(values.firstname);
		cy.get('input[data-cy="signup-lastname"]').type(values.lastname);
		cy.get('input[data-cy="signup-email"]').type(values.email);
		cy.get('input[data-cy="signup-phone"]').type(values.phone);
		cy.get('input[data-cy="signup-password"]').type(values.password).blur();
		values.referral_code && cy.get('input[data-cy="signup-referral-code"]').type(values.referral_code);
		cy.get('input[data-cy="signup-terms"]').check();
		cy.root().submit()
	});
})
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
