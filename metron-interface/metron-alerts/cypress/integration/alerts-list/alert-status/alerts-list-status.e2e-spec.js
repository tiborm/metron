/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const { loadTestData, deleteTestData } = require('../../utils/e2e_util');

describe('Test spec for login page', function() {

  before(() => {
    loadTestData();
  });

  beforeEach(() => {
    cy.request({
      method: 'GET',
      url: 'http://localhost:4200/api/v1/user',
      form: true,
      headers: {
        Authorization: 'Basic ' + btoa('user:password')
      }
    });
    cy.visit('http://localhost:4200/alerts-list');
  });

  after(() => {
    cy.get('.logout-link').click();
    deleteTestData();
  });

  function clickActionDropdownOption(elLabel) {
    cy.get('#dropdownMenuButton').click();
    cy.get('.dropdown-menu span').contains(elLabel).click();
  }

  it('should change alert status for multiple alerts to OPEN', function() {
    const rows = ['row-0','row-1','row-2'];

    rows.forEach((rowId) => {
      cy.get(`[data-qe-id="${rowId}"] input[type="checkbox"]`)
      .check({ force: true });  
    });
    
    rows.forEach((rowId) => {
      cy.get(`[data-qe-id="${rowId}"] [data-qe-id="cell-7"]`)
      .should((statusEl) => {
        expect(statusEl).to.contain('NEW');
      });
    });

    clickActionDropdownOption('Open');

    rows.forEach((rowId) => {
      cy.get(`[data-qe-id="${rowId}"] [data-qe-id="cell-7"]`)
      .should((statusEl) => {
        expect(statusEl).to.contain('OPEN');
      });
    });
  });

  it('should change alert status for multiple alerts to DISMISS', function() {
    const rows = ['row-5','row-6','row-7'];
    rows.forEach((rowId) => {
      cy.get(`[data-qe-id="${rowId}"] input[type="checkbox"]`)
      .check({ force: true });  
    });

    rows.forEach((rowId) => {
      cy.get(`[data-qe-id="${rowId}"] [data-qe-id="cell-7"]`)
      .should((statusEl) => {
        expect(statusEl).to.contain('NEW');
      });
    });

    clickActionDropdownOption('Dismiss');

    rows.forEach((rowId) => {
      cy.get(`[data-qe-id="${rowId}"] [data-qe-id="cell-7"]`)
      .should((statusEl) => {
        expect(statusEl).to.contain('DISMISS');
      });
    });
  });

  it('should change alert status for multiple alerts to ESCALATE', function() {
    const rows = ['row-8','row-9','row-10'];
    rows.forEach((rowId) => {
      cy.get(`[data-qe-id="${rowId}"] input[type="checkbox"]`)
      .check({ force: true });  
    });

    rows.forEach((rowId) => {
      cy.get(`[data-qe-id="${rowId}"] [data-qe-id="cell-7"]`)
      .should((statusEl) => {
        expect(statusEl).to.contain('NEW');
      });
    });

    clickActionDropdownOption('Escalate');

    rows.forEach((rowId) => {
      cy.get(`[data-qe-id="${rowId}"] [data-qe-id="cell-7"]`)
      .should((statusEl) => {
        expect(statusEl).to.contain('ESCALATE');
      });
    });
  });

  it('should change alert status for multiple alerts to RESOLVE', function() {
    const rows = ['row-11','row-12','row-13'];
    rows.forEach((rowId) => {
      cy.get(`[data-qe-id="${rowId}"] input[type="checkbox"]`)
      .check({ force: true });  
    });

    rows.forEach((rowId) => {
      cy.get(`[data-qe-id="${rowId}"] [data-qe-id="cell-7"]`)
      .should((statusEl) => {
        expect(statusEl).to.contain('NEW');
      });
    });

    clickActionDropdownOption('Resolve');

    rows.forEach((rowId) => {
      cy.get(`[data-qe-id="${rowId}"] [data-qe-id="cell-7"]`)
      .should((statusEl) => {
        expect(statusEl).to.contain('RESOLVE');
      });
    });
  });

  it('should change alert status for multiple alerts to OPEN in tree view', function() {
    cy.get('[data-name="source:type"]').click();
    cy.get('[data-name="enrichments:geo:ip_dst_addr:country"]').click();
    cy.wait(300);
    cy.get('.mrow.top-group').click();
    cy.get('[data-name="US"]').click();
    cy.get('[data-name="RU"]').click();
    cy.get('[data-name="FR"]').click();

    [
      { state: 'Open', subGroup: 'US', rows: [0,1,2] },
      { state: 'Dismiss', subGroup: 'US', rows: [3,4] },
      { state: 'Escalate', subGroup: 'RU', rows: [0,1,2] },
      { state: 'Resolve', subGroup: 'FR', rows: [0,1,2] },
    ].forEach((scenario) => {
      scenario.rows.forEach((rowId) => {
        cy.get(`[data-qe-id="subGroupItem-${scenario.subGroup}-${rowId}"] input`)
        .check({ force: true });  
      });
  
      clickActionDropdownOption(scenario.state);
  
      scenario.rows.forEach((rowId) => {
        cy.get(`[data-qe-id="subGroupItem-${scenario.subGroup}-${rowId}"] [data-name="alert_status"]`)
        .should((statusEl) => {
          expect(statusEl).to.contain(scenario.state.toUpperCase());
        });
      });  
    });
  });

});
