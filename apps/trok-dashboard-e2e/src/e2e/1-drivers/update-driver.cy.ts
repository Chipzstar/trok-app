import { faker } from '@faker-js/faker';

describe('Driver - Update Driver', () => {
	before(() => {
		cy.request({
			url: `${Cypress.env('API_BASE_URL')}/server/trpc/driver.createDriver`,
			method: 'POST',
			body: {
				userId: Cypress.env('TEST_USER_ID'),
				stripeId: Cypress.env('TEST_STRIPE_ACCOUNT_ID'),
				firstname: faker.name.firstName(),
				lastname: faker.name.lastName(),
				email: faker.internet.email(),
				phone: faker.phone.number("+447## ### ####"),
				address: {
					line1: `${faker.address.buildingNumber()} ${faker.address.streetName()}`,
					line2: faker.address.secondaryAddress(),
					city: faker.address.city(),
					postcode: faker.address.zipCode(),
					region: faker.address.state(),
					country: "GB",
				},
				has_spending_limit: true,
				spending_limit: {
					amount: 5000,
					interval: 'weekly'
				}
			}
		}).then(r => console.log(r));
	})

	beforeEach(() => {
		cy.visit('/').location('pathname').then(($path) => {
			cy.log("PATH: " + $path);
			if ($path === '/login') {
				cy.auth();
			}
			cy.visit('/drivers').location('pathname').should('equal', '/drivers');
		})
	});

	it("Update driver fields", () => {
		cy.get('[data-cy="driver-edit-button-0"]').should('be.visible').click()
		cy.get('[data-cy="edit-driver-form"]').should('be.visible');
		cy.updateDriver({
			firstname: "Chisom",
			lastname: "Oguibe",
			email: 'chisom.oguibe@googlemail.com',
			phone: '+447523958055',
			has_spending_limit: true,
		});
		cy.location('search').should('contain', '?driver_id=');
		cy.location('search')
			.then(s => new URLSearchParams(s))
			.invoke('get', 'driver_id')
			.then(id => {
				cy.log("DRIVER-ID:" + id)
			})
	})

	it("Remove existing spending limit", () => {
		cy.get('[data-cy="driver-edit-button-0"]').should('be.visible').click()
		cy.get('[data-cy="edit-driver-form"]').should('be.visible');
		cy.updateDriver({
			has_spending_limit: false,
			spending_limit: null
		})
		cy.location('search').should('contain', '?driver_id=');
		cy.location('search')
			.then(s => new URLSearchParams(s))
			.invoke('get', 'driver_id')
			.then(id => {
				cy.log("DRIVER-ID:" + id)
				cy.request({
					url: `${Cypress.env('API_BASE_URL')}/server/trpc/driver.getSingleDriver?input=${encodeURIComponent(
						JSON.stringify({ id })
					)}`,
					method: 'GET',
					headers: {
						Authorization: Cypress.env('ADMIN_USER_ID')
					}
				}).then(({ body }) => {
					cy.log(body.result.data);
					// check that there is no spending limit for the driver database record
					expect(body.result.data.spending_limit).to.eq(null);
				});
			})
	})

	after(() => {
		cy.location('search').should('contain', '?driver_id=');
		cy.location('search')
			.then(s => new URLSearchParams(s))
			.invoke('get', 'driver_id')
			.then(id => {
				cy.log(id)
				if (id) {
					cy.request({
						url: `${Cypress.env('API_BASE_URL')}/server/trpc/admin.deleteDriver`,
						method: 'POST',
						body: { driver_id: id },
						headers: {
							Authorization: Cypress.env('ADMIN_USER_ID')
						}
					}).then(r => console.log(r));
				}
			});
	});
})