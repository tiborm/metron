/// <reference types="Cypress" />

context('Grouping parser to aggregates', () => {
  beforeEach(() => {
    cy.server();
    cy.route({
      method: 'GET',
      url: '/api/v1/user',
      response: 'user'
    });

    cy.route({
      method: 'POST',
      url: '/api/v1/logout',
      response: []
    });

    cy.route('GET', '**/sensor/parser/config', 'fixture:parser-config.json');
    cy.route('GET', '**/sensor/parser/group', 'fixture:parser-group.json');
    cy.route('GET', '**/storm', 'fixture:storm-config.json');

    cy.visit('http://localhost:4200/login');
    cy.get('[name="user"]').type('user');
    cy.get('[name="password"]').type('password');
    cy.contains('LOG IN').click();
  });

  afterEach(() => {
    cy.get('.logout-link').click();
  });

});
