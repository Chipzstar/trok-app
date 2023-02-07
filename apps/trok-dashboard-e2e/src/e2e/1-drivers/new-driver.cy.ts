import { faker } from '@faker-js/faker';

describe('Driver - New Driver', () => {
	beforeEach(() => {
		cy.auth();
		cy.visit('/drivers').location('pathname').should('equal', '/drivers');
	});

	it('Missing firstname field', () => {
		cy.get('[data-cy="new-driver-btn"]').click();
		cy.get('[data-cy="add-driver-form"]').should('be.visible');
		cy.addNewDriver({
			lastname: "Oladapo",
			email: 'ola.oladapo7@gmail.com',
			phone: '+447523958055',
			line1: `${faker.address.buildingNumber()} ${faker.address.streetName()}`,
			line2: faker.address.secondaryAddress(),
			city: faker.address.city(),
			postcode: faker.address.zipCode(),
			region: faker.address.state(),
			country: faker.address.country(),
			has_spending_limit: false,
			spending_limit: {
				amount: 350000,
				interval: 'daily'
			}
		});
		cy.get('[data-cy="add-driver-form"]').should('be.visible');
	});

	it('Missing lastname field', () => {
		cy.get('[data-cy="new-driver-btn"]').click();
		cy.get('[data-cy="add-driver-form"]').should('be.visible');
		cy.addNewDriver({
			firstname: faker.name.firstName(),
			email: 'ola.oladapo7@gmail.com',
			phone: '+447523958055',
			line1: `${faker.address.buildingNumber()} ${faker.address.streetName()}`,
			line2: faker.address.secondaryAddress(),
			city: faker.address.city(),
			postcode: faker.address.zipCode(),
			region: faker.address.state(),
			country: faker.address.country(),
			has_spending_limit: false,
			spending_limit: {
				amount: 350000,
				interval: 'daily'
			}
		});
		cy.get('[data-cy="add-driver-form"]').should('be.visible');
	});

	it('Missing email field', () => {
		cy.get('[data-cy="new-driver-btn"]').click();
		cy.get('[data-cy="add-driver-form"]').should('be.visible');
		cy.addNewDriver({
			firstname: faker.name.firstName(),
			lastname: faker.name.lastName(),
			phone: '+447523958055',
			line1: `${faker.address.buildingNumber()} ${faker.address.streetName()}`,
			line2: faker.address.secondaryAddress(),
			city: faker.address.city(),
			postcode: faker.address.zipCode(),
			region: faker.address.state(),
			country: faker.address.country(),
			has_spending_limit: false,
			spending_limit: {
				amount: 350000,
				interval: 'daily'
			}
		});
		cy.get('[data-cy="add-driver-form"]').should('be.visible');
	});

	it('Missing phone field', () => {
		cy.get('[data-cy="new-driver-btn"]').click();
		cy.get('[data-cy="add-driver-form"]').should('be.visible');
		cy.addNewDriver({
			firstname: faker.name.firstName(),
			lastname: faker.name.lastName(),
			email: 'ola.oladapo7@gmail.com',
			line1: `${faker.address.buildingNumber()} ${faker.address.streetName()}`,
			line2: faker.address.secondaryAddress(),
			city: faker.address.city(),
			postcode: faker.address.zipCode(),
			region: faker.address.state(),
			country: faker.address.country(),
			has_spending_limit: false,
			spending_limit: {
				amount: 350000,
				interval: 'daily'
			}
		});
		cy.get('[data-cy="add-driver-form"]').should('be.visible');
	});

	it('Missing address line1 field', () => {
		cy.get('[data-cy="new-driver-btn"]').click();
		cy.get('[data-cy="add-driver-form"]').should('be.visible');
		cy.addNewDriver({
			firstname: faker.name.firstName(),
			lastname: faker.name.lastName(),
			email: 'ola.oladapo7@gmail.com',
			phone: '+447523958055',
			line2: faker.address.secondaryAddress(),
			city: faker.address.city(),
			postcode: faker.address.zipCode(),
			region: faker.address.state(),
			country: faker.address.country(),
			has_spending_limit: false,
			spending_limit: {
				amount: 350000,
				interval: 'daily'
			}
		});
		cy.get('[data-cy="add-driver-form"]').should('be.visible');
	});

	it('Missing city field', () => {
		cy.get('[data-cy="new-driver-btn"]').click();
		cy.get('[data-cy="add-driver-form"]').should('be.visible');
		cy.addNewDriver({
			firstname: faker.name.firstName(),
			lastname: faker.name.lastName(),
			email: 'ola.oladapo7@gmail.com',
			phone: '+447523958055',
			line1: `${faker.address.buildingNumber()} ${faker.address.streetName()}`,
			line2: faker.address.secondaryAddress(),
			postcode: faker.address.zipCode(),
			region: faker.address.state(),
			country: faker.address.country(),
			has_spending_limit: false,
			spending_limit: {
				amount: 350000,
				interval: 'daily'
			}
		});
		cy.get('[data-cy="add-driver-form"]').should('be.visible');
	});

	it('Missing postcode field', () => {
		cy.get('[data-cy="new-driver-btn"]').click();
		cy.get('[data-cy="add-driver-form"]').should('be.visible');
		cy.addNewDriver({
			firstname: faker.name.firstName(),
			lastname: faker.name.lastName(),
			email: 'ola.oladapo7@gmail.com',
			phone: '+447523958055',
			line1: `${faker.address.buildingNumber()} ${faker.address.streetName()}`,
			line2: faker.address.secondaryAddress(),
			city: faker.address.city(),
			region: faker.address.state(),
			country: faker.address.country(),
			has_spending_limit: false,
			spending_limit: {
				amount: 350000,
				interval: 'daily'
			}
		});
		cy.get('[data-cy="add-driver-form"]').should('be.visible');
	});

	it('Missing region field', () => {
		cy.get('[data-cy="new-driver-btn"]').click();
		cy.get('[data-cy="add-driver-form"]').should('be.visible');
		cy.addNewDriver({
			firstname: faker.name.firstName(),
			lastname: faker.name.lastName(),
			email: 'ola.oladapo7@gmail.com',
			phone: '+447523958055',
			line1: `${faker.address.buildingNumber()} ${faker.address.streetName()}`,
			line2: faker.address.secondaryAddress(),
			city: faker.address.city(),
			postcode: faker.address.zipCode(),
			country: faker.address.country(),
			has_spending_limit: false,
			spending_limit: {
				amount: 350000,
				interval: 'daily'
			}
		});
		cy.get('[data-cy="add-driver-form"]').should('be.visible');
	});

	it('Missing spending-limit amount field', () => {
		cy.get('[data-cy="new-driver-btn"]').click();
		cy.get('[data-cy="add-driver-form"]').should('be.visible');
		cy.addNewDriver({
			firstname: faker.name.firstName(),
			lastname: faker.name.lastName(),
			email: 'ola.oladapo7@gmail.com',
			phone: '+447523958055',
			line1: `${faker.address.buildingNumber()} ${faker.address.streetName()}`,
			line2: faker.address.secondaryAddress(),
			city: faker.address.city(),
			postcode: faker.address.zipCode(),
			region: faker.address.state(),
			has_spending_limit: true,
			//@ts-ignore
			spending_limit: {
				interval: 'daily'
			}
		});
		cy.get('[data-cy="add-driver-form"]').should('be.visible');
	});

	it('Missing spending-limit interval field', () => {
		cy.get('[data-cy="new-driver-btn"]').click();
		cy.get('[data-cy="add-driver-form"]').should('be.visible');
		cy.addNewDriver({
			firstname: faker.name.firstName(),
			lastname: faker.name.lastName(),
			email: 'ola.oladapo7@gmail.com',
			phone: '+447523958055',
			line1: `${faker.address.buildingNumber()} ${faker.address.streetName()}`,
			line2: faker.address.secondaryAddress(),
			city: faker.address.city(),
			postcode: faker.address.zipCode(),
			region: faker.address.state(),
			has_spending_limit: true,
			//@ts-ignore
			spending_limit: {
				amount: 1000
			}
		});
		cy.get('[data-cy="add-driver-form"]').should('be.visible');
	});

	it('Create driver without spending limit', () => {
		cy.get('[data-cy="new-driver-btn"]').click();
		cy.get('[data-cy="add-driver-form"]').should('be.visible');
		cy.addNewDriver({
			firstname: faker.name.firstName(),
			lastname: faker.name.lastName(),
			email: 'ola.oladapo7@gmail.com',
			phone: '+447523958055',
			line1: `${faker.address.buildingNumber()} ${faker.address.streetName()}`,
			line2: faker.address.secondaryAddress(),
			city: faker.address.city(),
			postcode: faker.address.zipCode(),
			region: faker.address.state(),
			has_spending_limit: false
		});
		cy.root().find('[data-cy="add-driver-form"]').should('not.exist');
	});

	it('Create driver with spending limit', () => {
		cy.get('[data-cy="new-driver-btn"]').click();
		cy.get('[data-cy="add-driver-form"]').should('be.visible');
		cy.addNewDriver({
			firstname: faker.name.firstName(),
			lastname: faker.name.lastName(),
			email: 'ola.oladapo7@gmail.com',
			phone: '+447523958055',
			line1: `${faker.address.buildingNumber()} ${faker.address.streetName()}`,
			line2: faker.address.secondaryAddress(),
			city: faker.address.city(),
			postcode: faker.address.zipCode(),
			region: faker.address.state(),
			has_spending_limit: true,
			spending_limit: {
				amount: 5000,
				interval: 'daily'
			}
		});
		cy.root().find('[data-cy="add-driver-form"]').should('not.exist');
	});

	afterEach(() => {
		cy.location('search')
			.then(s => new URLSearchParams(s))
			.invoke('get', 'driver_id')
			.then(id => {
				if (id) {
					cy.log(id)
					cy.request({
						url: `${Cypress.env('API_BASE_URL')}/server/trpc/admin.deleteDriver`,
						method: 'POST',
						body: { driver_id: id },
						headers: {
							Authorization: Cypress.env('ADMIN_USER_ID')
						}
					}).then(r => console.log(r));
				} else {
					cy.log('No Driver-ID found');
				}
			});
	});
});
