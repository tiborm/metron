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
      url: '**/logout',
      response: []
    });

    cy.route('GET', '**/sensor/parser/config', 'fixture:parser-config.json');
    cy.route('GET', '**/sensor/parser/group', 'fixture:parser-group.json');
    cy.route('GET', '**/storm', 'fixture:storm-config.json');
    cy.route('GET', '**/storm/parser/stop/yaf', {"status":"SUCCESS"}).as('stopParser');
    cy.route('GET', '**/storm/parser/deactivate/yaf', {"status":"SUCCESS"}).as('disableParser');
    cy.route('GET', '**/storm/parser/activate/asa', {"status":"SUCCESS"}).as('enableParser');

    cy.visit('http://localhost:4200/login');
    cy.get('[name="user"]').type('user');
    cy.get('[name="password"]').type('password');
    cy.contains('LOG IN').click();
  });

  afterEach(() => {
    cy.get('.logout-link').click();
  });

  it('should start parsers from actions', () => {
    cy.get('[data-qe-id="add-sensor-button"]').should('be.visible');

    ['yaf'].map(
      pName => {
        cy.get(`[data-qe-id="sensor-tr-${pName}"] [data-qe-id="stop-parser-button"]`).click();
        cy.fixture('storm-config.json').then((json) => {
          json.filter((sensor) => {
            if (sensor.name === 'yaf') sensor.status = 'KILLED';
          })
          cy.route('GET', '**/storm', json).as('stopParserUpdate');
        });
        cy.wait('@stopParserUpdate', { timeout: 10000 });
        cy.get(`[data-qe-id="sensor-tr-${pName}"] [data-qe-id="start-parser-button"]`).should('be.visible');
      }
    );
  });

  it('should have correct values', () => {
    const status = ['Running', '', '', 'Stopped', '', '', 'Running', 'Running', 'Running', 'Running', 'Disabled', 'Running'];
    const latency = ['31.29ms', '', '', '-', '', '', '100ms', '40.28ms', '34.15ms', '74ms', '-', '87.89ms'];
    const throughput = ['68.34kb/s', '', '', '-', '', '', '77.59kb/s', '39.58kb/s', '72.91kb/s', '6.13kb/s', '-', '87.44kb/s'];
    cy.get('[data-qe-id="sensor-status"').each((sensor, index) => {
      expect(sensor).to.contain(status[index]);
    });
    cy.get('[data-qe-id="sensor-latency"').each((sensor, index) => {
      expect(sensor).to.contain(latency[index]);
    });
    cy.get('[data-qe-id="sensor-throughput"').each((sensor, index) => {
      expect(sensor).to.contain(throughput[index]);
    });
    cy.get('[data-qe-id="sensor-modified-by-date"').each((sensor) => {
      expect(sensor).to.contain('');
    });
    cy.get('[data-qe-id="sensor-modified-by"').each((sensor) => {
      expect(sensor).to.contain('');
    });
  });

  it('should disable parsers from actions', () => {
    ['yaf'].map(
      pName => {
        cy.get(`[data-qe-id="sensor-tr-${pName}"] [data-qe-id="disable-parser-button"]`).click();
        cy.fixture('storm-config.json').then((json) => {
          json.filter((sensor) => {
            if (sensor.name === 'yaf') sensor.status = 'INACTIVE';
          })
          cy.route('GET', '**/storm', json).as('disableParserUpdate');
        });
        cy.wait('@disableParserUpdate', { timeout: 10000 });
        cy.get(`[data-qe-id="sensor-tr-${pName}"] [data-qe-id="enable-parser-button"]`).should('be.visible');
        cy.get(`[data-qe-id="sensor-tr-${pName}"] [data-qe-id="sensor-status"]`).should('contain', 'Disabled');
      }
    );
  });

  it('should disable parsers from actions', () => {
    ['asa'].map(
      pName => {
        cy.get(`[data-qe-id="sensor-tr-${pName}"] [data-qe-id="enable-parser-button"]`).click();
        cy.fixture('storm-config.json').then((json) => {
          json.filter((sensor) => {
            if (sensor.name === 'asa') sensor.status = 'ACTIVE';
          })
          cy.route('GET', '**/storm', json).as('enableParserUpdate');
        });
        cy.wait('@enableParserUpdate', { timeout: 10000 });
        cy.get(`[data-qe-id="sensor-tr-${pName}"] [data-qe-id="disable-parser-button"]`).should('be.visible');
        cy.get(`[data-qe-id="sensor-tr-${pName}"] [data-qe-id="sensor-status"]`).should('contain', 'Running');
      }
    );
  });

});
