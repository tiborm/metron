/// <reference types="Cypress" />

context('Grouping parser to aggregates', () => {
  beforeEach(() => {
    cy.server();
    cy.route({
      method: 'GET',
      url: '/api/v1/user',
      response: 'user'
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

  function dragAndDrop(draggedItem, target) {
    const dataTransfer = new DataTransfer();
    cy.get(`[data-qe-id="sensor-drag-handle-${draggedItem}"]`)
      .trigger('dragstart', {
        dataTransfer: dataTransfer
      });
    cy.get(`[data-qe-id="sensor-tr-${target}"]`)
      .trigger('drop');
  }

  it('should have title defined', () => {
    cy.get('[data-qe-id="metron-page-title"]').should('contain', 'Sensors (12)');
  })

  it('should create a new group when one sensor is dragged on top of another', () => {
    cy.get('[data-qe-id^="sensor-tr-"]').should('have.length', 12);
    cy.get('.drag-handle').should('have.attr', 'draggable');
    dragAndDrop('websphere', 'yaf');
    cy.get('[data-qe-id="parser-sidebar-name-input"]').should('have.value', 'Aggregate: websphere + yaf');
    cy.get('[data-qe-id="parser-sidebar-save-button"]').click();
    cy.get('[data-qe-id^="sensor-tr-"]').should('have.length', 13);
    cy.get('[data-qe-id^="sensor-tr-Aggregate: websphere + yaf"]').should('have.class', 'phantom');
    cy.get('[data-qe-id^="sensor-tr-websphere"]').should('have.class', 'dirty');
    cy.get('[data-qe-id^="sensor-tr-yaf"]').should('have.class', 'dirty');
  });

  it('should return the sensor list to its original state when cancelled', () => {
    cy.get('[data-qe-id^="sensor-tr-"]').should('have.length', 12);
    dragAndDrop('websphere', 'yaf');
    cy.get('[data-qe-id="parser-sidebar-cancel-button"]').click();
    cy.get('[data-qe-id^="sensor-tr-"]').should('have.length', 12);
  });

  it("should merge grouped sensor into group when a user selects 'merge'", () => {
    dragAndDrop('jsonMap', 'websphere');
    cy.get('[data-qe-id="parser-sidebar-save-button"]').click();
    cy.get('[data-qe-id^="sensor-tr-jsonMap"]').should('have.class','dirty');
    cy.get('[data-qe-id^="sensor-tr-"]').eq(2).contains('jsonMap');
  });

  it("should create a new group when a user selects 'create new'", () => {
    dragAndDrop('jsonMap', 'websphere');
    cy.get('[data-qe-id="parser-sidebar-merge-button"]').click();
    cy.get('[data-qe-id="parser-sidebar-save-button"]').click();
    cy.get('[data-qe-id="parser-sidebar-save-button"]').click();
    cy.get('[data-qe-id^="sensor-tr-Aggregate: jsonMap + websphere"]')
      .should('have.class', 'phantom')
      .contains('Aggregate: jsonMap + websphere');
    cy.get('[data-qe-id^="sensor-tr-jsonMap"]').should('have.class', 'dirty');
    cy.get('[data-qe-id^="sensor-tr-websphere"]').should('have.class', 'dirty');
  });

})
