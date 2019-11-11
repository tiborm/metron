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

  const triggerEventOn = (parserName, event) => {
    cy.get(`[data-qe-id="parser-row-${parserName}"]`).then(el => {
      el[0].dispatchEvent(event);
    });
  }

  const startDrag = (parserName) => {
    const event = new MouseEvent('dragstart');
    event.dataTransfer = new DataTransfer();
    triggerEventOn(parserName, event);
  }

  const dragOver = (parserName, insertTo) => {
    cy.get(`[data-qe-id="parser-row-${parserName}"]`).then(el => {
      const clientRects = el[0].getClientRects()[0];
      const event = new MouseEvent('dragover', {
        clientX: clientRects.left + 20,
        clientY: insertTo === 'before' ? clientRects.top + 4 : clientRects.bottom - 4
      });

      triggerEventOn(parserName, event);
    });
  }

  const dropOn = (parserName) => {
    triggerEventOn(parserName, new MouseEvent('drop'));
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

  it('Stopping bro__snort__yaf group', () => {
    cy.get('[data-qe-id*="parser-row"]:nth-of-type(1) [data-qe-id="stop-parser-button"]').click();
    cy.contains('[data-qe-id*="parser-row"]:nth-of-type(1) td:nth-of-type(4)', 'Stopped');
  });


  it('Disassembling bro__snort__yaf group', () => {
    cy.log('Dragging BRO parser out from bro__snort__yaf');
    startDrag('bro');
    dragOver('jsonMapQuery', 'after');
    dropOn('jsonMapQuery');

    startDrag('snort');
    dragOver('jsonMapQuery', 'after');
    dropOn('jsonMapQuery');

    startDrag('yaf');
    dragOver('jsonMapQuery', 'after');
    dropOn('jsonMapQuery');

    cy.contains('APPLY').click();
    cy.wait(5000);

    cy.route('GET', '/api/v1/sensor/parser/config').as('getParserConfigs');
    cy.route('GET', '/api/v1/sensor/parser/group').as('getParserGroups');

    cy.reload();

    cy.log('Asserting parser/config API response');
    cy.wait('@getParserConfigs').then((xhr) => {
      // FIXME this type of assertation not works
      cy.wrap(xhr.response.body.bro.group, ).should('be', 'kaka');
      cy.wrap(xhr.response.body.yaf.group, ).should('be', '');
      cy.wrap(xhr.response.body.snort.group, ).should('be', '');
      // debugger;
    })

  });

});
