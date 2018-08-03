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
// import { customMatchers } from '../../matchers/custom-matchers';
import { LoginPage } from '../../login/login.po';
import { loadTestData, deleteTestData } from '../../utils/e2e_util';

describe('Test spec for metron details page', function() {

  before(() => {
    loadTestData();
    // jasmine.addMatchers(customMatchers);
    cy.request({
      method: 'GET',
      url: 'http://localhost:4200/api/v1/user',
      form: true,
      headers: {
        'Authorization': 'Basic ' + btoa('user:password')
      }
    });
  });

  after(() => {
    cy.get('.logout-link').click();
    deleteTestData();
  });

  // Commented out due to a currently opened bug when trying to change status
  // it('should change alert statuses', () => {
  //   let alertId = '2cc174d7-c049-aaf4-d0d6-138073777309';

  //   // await page.navigateTo(alertId);
  //   cy.visit('http://localhost:4200/alerts-list(dialog:details/alerts_ui_e2e/' + alertId + '/alerts_ui_e2e_index)')
  //   // expect(await page.getAlertStatus('ANY')).toEqual('NEW');
  //   cy.get('[data-qe-id="alert_status_value"]').should('contain', 'NEW')
  //   // expect(await page.getAlertStatus('NEW')).toEqual('OPEN');
  //   // expect(await listPage.getAlertStatusById(alertId)).toEqual('OPEN');
  //   cy.get('[data-name="open"]').click();
  //   cy.get('[data-qe-id="alert_status_value"]').should('contain', 'OPEN')
  //   // await page.clickDismiss();
  //   // expect(await page.getAlertStatus('OPEN')).toEqual('DISMISS');
  //   // expect(await listPage.getAlertStatusById(alertId)).toEqual('DISMISS');
  //   cy.get('[data-name="dismiss"]').click();
  //   cy.get('[data-qe-id="alert_status_value"]').should('contain', 'DISMISS')
  //   // await page.clickEscalate();
  //   // expect(await page.getAlertStatus('DISMISS')).toEqual('ESCALATE');
  //   // expect(await listPage.getAlertStatusById(alertId)).toEqual('ESCALATE');
  //   cy.get('[data-name="escalate"]').click();
  //   cy.get('[data-qe-id="alert_status_value"]').should('contain', 'ESCALATE')
  //   // await page.clickResolve();
  //   // expect(await page.getAlertStatus('ESCALATE')).toEqual('RESOLVE');
  //   // expect(await listPage.getAlertStatusById(alertId)).toEqual('RESOLVE');
  //   cy.get('[data-name="resolve"]').click();
  //   cy.get('[data-qe-id="alert_status_value"]').should('contain', 'RESOLVE')
  //   // await page.clickNew();
  // });

  it('should add comments for table view', () => {
    const comment1 = 'This is a sample comment';
    const comment2 = 'Yet another comment';
    const userNameAndTimestamp = '- user - a few seconds ago';
    const alertId = '2cc174d7-c049-aaf4-d0d6-138073777309';

    cy.visit('http://localhost:4200/alerts-list(dialog:details/alerts_ui_e2e/' + alertId + '/alerts_ui_e2e_index)')
    .then(() => {

    })
    cy.get('app-alert-details .fa.fa-comment').click()

    // add comment 1
    cy.get('app-alert-details textarea').type(comment1)
    cy.get('[data-qe-id="add-comment-button"]').click()
    cy.get('[data-qe-id="comment"]').first().should('contain', comment1)
    cy.get('[data-qe-id="username-timestamp"]').first().should('contain', userNameAndTimestamp)

    // add comment 2
    cy.get('app-alert-details textarea').type(comment2)
    cy.get('[data-qe-id="add-comment-button"]').click()
    cy.get('[data-qe-id="comment"]').first().should('contain', comment2)
    cy.get('[data-qe-id="username-timestamp"]').first().should('contain', userNameAndTimestamp)

    // cancel comment deletion
    cy.get('[data-qe-id="delete-comment"]').invoke('show').first().click({force:true})
    cy.get('[data-qe-id="dialog-cancel-action"]').click()

    // delete comment2
    cy.get('[data-qe-id="delete-comment"]').invoke('show').first().click({force:true})
    cy.get('[data-qe-id="dialog-approve-action"]').click()
    cy.get('[data-qe-id="comment"]').first().should('contain', comment1)
    cy.get('[data-qe-id="username-timestamp"]').first().should('contain', userNameAndTimestamp)

    // delete comment1
    cy.get('[data-qe-id="delete-comment"]').invoke('show').first().click({force:true})
    cy.get('[data-qe-id="dialog-approve-action"]').click()
    cy.get('.close-button').click();
  });

});