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

  it('should have correct values when parser is running', () => {
    cy.get('table tbody tr').each(tr => {
      console.log(tr);
    });
  });

  it('should have all the table headers', () => {
    const headerText = [
      'Name',
      'Parser',
      'Status',
      'Latency',
      'Throughput',
      'Last Updated',
      'Last Editor'
    ];
    cy.get('[data-qe-id="sensor-table-header"]').each((el, index) => {
      expect(el).to.contain(headerText[index]);
    });
  });

  it('should select deselect all rows', () => {
    cy.get('[data-qe-id="sensor-table-select-all"]').click();
    cy.get('tr.active').should('have.length', 12);
    cy.get('[data-qe-id="sensor-table-select-all"]').click();
    cy.get('tr.active').should('have.length', 0);
  });

  it('should select deselect individual rows', () => {
    ['websphere', 'jsonMap', 'squid', 'asa', 'snort', 'bro', 'yaf'].map(
      pName => {
        cy.get(`[data-qe-id="sensor-select-${pName}"]`).click();
        cy.get('tr.active').should('have.length', 1);
        cy.get(`[data-qe-id="sensor-select-${pName}"]`).click();
        cy.get('tr.active').should('have.length', 0);
      }
    );
  });

  it('should enable action in dropdown', () => {
    cy.get('[data-qe-id="action-dropdown-action"]:not(.disabled)').should(
      'have.length',
      0
    );
    cy.get('[data-qe-id="action-dropdown-action"].disabled').should(
      'have.length',
      5
    );
    cy.get('[data-qe-id="action-dropdown-menu"]').should('not.be.visible');

    cy.get('[data-qe-id="sensor-table-select-all"]').click();
    cy.get('[data-qe-id="action-dropdown"]').click();
    cy.get('[data-qe-id="action-dropdown-action"]:not(.disabled)').should(
      'have.length',
      5
    );
    cy.get('[data-qe-id="action-dropdown-action"].disabled').should(
      'have.length',
      0
    );
    cy.get('[data-qe-id="action-dropdown-menu"]').should('be.visible');
    cy.get('[data-qe-id="action-dropdown"]').click();
    cy.get('[data-qe-id="sensor-table-select-all"]').click();

    ['websphere', 'jsonMap', 'squid', 'asa', 'snort', 'bro', 'yaf'].map(
      pName => {
        cy.get(`[data-qe-id="sensor-select-${pName}"]`).click();
        cy.get('[data-qe-id="action-dropdown"]').click();
        cy.get('[data-qe-id="action-dropdown-action"]:not(.disabled)').should(
          'have.length',
          5
        );
        cy.get('[data-qe-id="action-dropdown-action"].disabled').should(
          'have.length',
          0
        );
        cy.get('[data-qe-id="action-dropdown-menu"]').should('be.visible');
        cy.get('[data-qe-id="action-dropdown"]').click();
        cy.get(`[data-qe-id="sensor-select-${pName}"]`).click();
      }
    );
  });

  it('should open the details pane', () => {
    ['websphere', 'jsonMap', 'squid', 'asa', 'snort', 'bro', 'yaf'].map(
      pName => {
        cy.get(`[data-qe-id="sensor-tr-${pName}"]`).click();
        cy.url().should(
          'eq',
          `http://localhost:4200/sensors(dialog:sensors-readonly/${pName})`
        );
      }
    );
  });

  it('should open the edit pane', () => {
    ['websphere', 'jsonMap', 'squid', 'asa', 'snort', 'bro', 'yaf'].map(
      pName => {
        cy.get(
          `[data-qe-id="sensor-tr-${pName}"] [data-qe-id="edit-parser-button"]`
        ).click();
        cy.url().should(
          'eq',
          `http://localhost:4200/sensors(dialog:sensors-config/${pName})`
        );
      }
    );
  });
});
