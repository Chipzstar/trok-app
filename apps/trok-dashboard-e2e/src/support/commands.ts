// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

import {
	OnboardingBusinessInfo,
	OnboardingDirectorInfo,
	OnboardingFinancialInfo, OnboardingLocationInfo,
	SignupInfo
} from '@trok-app/shared-utils';

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace Cypress {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		interface Chainable<Subject> {
			login(email: string, password: string): void;

			logout(): void;

			signup(values: SignupInfo): void;

			onboardingStep1(values: OnboardingBusinessInfo, has_file?: boolean);

			onboardingStep2(values: OnboardingDirectorInfo);
			onboardingStep3(values: OnboardingFinancialInfo);
			onboardingStep4(values: OnboardingLocationInfo, delay?: number);
		}
	}
}
//
// -- This is a parent command --
Cypress.Commands.addAll({
	login(email, password) {
		cy.log('Logging in...');
		cy.get('[data-cy="login-form"]').within(function() {
			cy.get('input[data-cy="login-email"]').type(email);
			cy.get('.mantine-PasswordInput-visibilityToggle').then(($btn) => cy.wrap($btn));
			cy.get('input[data-cy="login-password"]').type(password);
			cy.root().submit().wait(2000);
		});
	},
	logout() {
		cy.log('Logging out...');
		cy.get('[data-cy="logout-button"]').click();
	}
});
Cypress.Commands.add('signup', (values) => {
	cy.log('Signing up...');
	cy.get('[data-cy="signup-form"]').within(function() {
		cy.get('input[data-cy="signup-firstname"]').type(values.firstname);
		cy.get('input[data-cy="signup-lastname"]').type(values.lastname);
		cy.get('input[data-cy="signup-email"]').type(values.email);
		cy.get('input[data-cy="signup-phone"]').type(values.phone);
		cy.get('input[data-cy="signup-password"]').type(values.password).blur();
		values.referral_code && cy.get('input[data-cy="signup-referral-code"]').type(values.referral_code);
		cy.get('input[data-cy="signup-terms"]').check();
		cy.root().submit().wait(2000);
	});
});

Cypress.Commands.add('onboardingStep1', (values, has_file = false) => {
	cy.log('Completing Onboarding step 1...');
	cy.get('[data-cy="onboarding-company-form"]').within(function() {
		cy.get('input[data-cy="onboarding-legal-name"]').type(values.legal_name);
		cy.get('input[data-cy="onboarding-business-crn"]').type(values.business_crn);
		cy.get('input[data-cy="onboarding-num-vehicles"]').type(String(values.num_vehicles));
		cy.get('input[data-cy="onboarding-weekly-fuel-spend"]').type(String(values.weekly_fuel_spend));
		cy.get('input[data-cy="onboarding-business-url"]').type(String(values.business_url));
		cy.get('input[data-cy="onboarding-merchant-category-code"]').click().get('.mantine-Select-dropdown').click();
		cy.get('input[data-cy="onboarding-business-type"]').click().get('.mantine-Select-dropdown').click();
		if (has_file) {
			cy.fixture('test-file.jpg').as('myFixture');
			cy.get('input[type=file]')
				.invoke('attr', 'style', 'display: block')
				.should('have.attr', 'style', 'display: block')
				.selectFile('@myFixture');
		}
		cy.root().submit().wait(has_file ? 3000 : 1000);
	});
});

Cypress.Commands.add('onboardingStep2', (values) => {
	cy.log('Completing Onboarding step 2...');
	cy.get('[data-cy="onboarding-director-form"]').within(function() {
		cy.get('input[data-cy="onboarding-director-firstname"]').type(values.firstname);
		cy.get('input[data-cy="onboarding-director-lastname"]').type(values.lastname);
		cy.get('input[data-cy="onboarding-director-email"]').type(String(values.email));
		cy.get('input[data-cy="onboarding-director-dob"]').click()
			.get('.mantine-DatePicker-dropdown').within(($picker) => {
			cy.get('.mantine-DatePicker-yearPicker');
			cy.get('.mantine-DatePicker-calendarHeader > button').first().click().click();
			cy.get('.mantine-DatePicker-yearPickerControls > button').first().click();
			cy.get('.mantine-DatePicker-monthPicker');
			cy.get('.mantine-DatePicker-monthPickerControls > button').first().click();
			cy.get('.mantine-DatePicker-calendarBase');
			cy.get('table > tbody > tr').eq(1).get('td > button').first().click();
		});
		cy.get('input[data-cy="onboarding-director-line1"]').type(String(values.line1));
		cy.get('input[data-cy="onboarding-director-city"]').type(String(values.city));
		cy.get('input[data-cy="onboarding-director-postcode"]').type(String(values.postcode));
		cy.get('input[data-cy="onboarding-director-region"]').type(String(values.region));
		cy.root().submit().wait(1000);
	});
});

Cypress.Commands.add('onboardingStep3', (values) => {
	cy.log('Completing Onboarding step 3...');
	cy.get('[data-cy="onboarding-finance-form"]').within(function() {
		cy.get('input[data-cy="onboarding-average-monthly-revenue"]').type(String(values.average_monthly_revenue))
		cy.root().submit().wait(1000);
	})
})

Cypress.Commands.add('onboardingStep4', (values, delay=1000) => {
	cy.log('Completing Onboarding step 4...');
	cy.get('[data-cy="onboarding-location-form"]').within(function() {
		cy.get('input[data-cy="onboarding-location-line1"]').type(values.line1)
		cy.get('input[data-cy="onboarding-location-line2"]').type(values.line2)
		cy.get('input[data-cy="onboarding-location-city"]').type(values.city)
		cy.get('input[data-cy="onboarding-location-postcode"]').type(values.postcode)
		cy.get('input[data-cy="onboarding-location-region"]').type(values.region)
		cy.get('input[data-cy="onboarding-location-country"]').type(values.country)
		cy.get('input[data-cy="onboarding-card-business-name"]').type(values.card_business_name)
		cy.root().submit().wait(delay);
	})
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
