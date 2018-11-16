/// <reference types="Cypress" />

context('Grouping parser to aggregates', () => {
  beforeEach(() => {
    cy.server();
    cy.route({
      method: 'GET',
      url: '/api/v1/user',
      response: 'user'
    });

    cy.route('GET', '**/parser/config', 'fixture:parser-config.json');
    cy.route('GET', '**/storm', 'fixture:storm-config.json');

    // cy.route({
    //   method: 'GET',
    //   url: '/api/v1/pcap?state=*',
    //   response: []
    // }).as('runningJobs');

    cy.visit('http://localhost:4200/login');
    cy.get('[name="user"]').type('user');
    cy.get('[name="password"]').type('password');
    cy.contains('LOG IN').click();
  })

  it('drag handles', () => {
    
  })
})
