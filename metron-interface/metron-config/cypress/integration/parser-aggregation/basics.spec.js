/// <reference types="Cypress" />
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
describe('PCAP Tab', () => {

  const startDrag = (parserName) => {
    return cy.get(`[data-qe-id="parser-row-${parserName}"]`).then(el => {
      const event = new MouseEvent('dragstart');
      event.dataTransfer = new DataTransfer();
      el[0].dispatchEvent(event);
    });
  }

  const dropOn = (parserName) => {
    cy.get(`[data-qe-id="parser-row-${parserName}"]`).then(el => el[0].dispatchEvent(new MouseEvent('drop')));
  }

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

    cy.route('GET', '/api/v1/global/config', 'fixture:config.json');

    cy.visit('login');
    cy.get('[name="user"]').type('user');
    cy.get('[name="password"]').type('password');
    cy.contains('LOG IN').click();
  });

  // it('Parser aggregate creation', () => {
  //   startDrag('snort');
  //   dropOn('bro');
  // });

  it('Stopping and disassembling defult bro__snort__yaf group', () => {
    cy.get('[data-qe-id*="parser-row"]:nth-of-type(1) [data-qe-id="stop-parser-button"]').click();
    cy.contains('[data-qe-id*="parser-row"]:nth-of-type(1) td:nth-of-type(4)', 'Stopped');

    // cy.get(`[data-qe-id="parser-row-bro"]`).then(el => el[0].dispatchEvent(new MouseEvent('mousemove', { clientX: 10, clientY: 50 })));

    cy.get(`[data-qe-id="parser-row-bro"]`).trigger('mousemove', { clientX: 10, clientY: 50 });
  });

});
