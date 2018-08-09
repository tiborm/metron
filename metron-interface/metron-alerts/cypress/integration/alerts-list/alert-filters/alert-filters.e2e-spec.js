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
import { loadTestData, deleteTestData } from '../../utils/e2e_util';

describe('Test spec for facet filters', function() {
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

  it('should display facets data', () => {
    const facetValues = [
      'enrichm...:country 3',
      'ip_dst_addr 8',
      'ip_src_addr 6',
      'source:type 1'
    ];

    cy.get('app-alert-filters .title').should('contain', 'Filters');
    cy.get('app-alert-filters metron-collapse').should(facet => {
      expect(facet[0].innerText).to.contain(facetValues[0]);
      expect(facet[1].innerText).to.contain(facetValues[1]);
      expect(facet[2].innerText).to.contain(facetValues[2]);
      expect(facet[3].innerText).to.contain(facetValues[3]);
    });
  });

  it('should search when facet is selected', () => {
    cy.get('[data-qe-id="alerts-total"]').should('contain', 'Alerts (169)');
    cy.get('[data-qe-id="collapse-toggle"]')
      .eq(1)
      .click();
    cy.get('[data-qe-id="collapse-drawer"]')
      .eq(1)
      .should('have.class', 'collapse show');
    cy.get('[data-qe-id="collapse-drawer"]')
      .find('li[title="95.163.121.204"]')
      .click();
    cy.get('[data-qe-id="alerts-total"]').should('contain', 'Alerts (44)');
  });
});
