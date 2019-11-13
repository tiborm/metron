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
describe('Parser Aggregation Basics', () => {

  const GROUPED_PARSER_MARKER = '---';

  const PARSER_IDS = {
    DEFAULT_GROUP: 'bro__snort__yaf',
    BRO: 'bro',
    SNORT: 'snort',
    YAF: 'yaf'
  }

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

  const assertConfirmMessageAppears = confirmMsg => {
    cy.contains(confirmMsg).should((elements) => {
      expect(elements[0].parentElement.classList.contains('alert-success')).to.eq(true);
      expect(elements[0].innerText).to.eq(confirmMsg);
    });
  }

  const assertIsGroup = (parserId, assertTo) => {
    cy.log(`Asserting ${parserId} is ${ !assertTo ? 'not' : '' } in a group...`);

    cy.get(`[data-qe-id="parser-row-${parserId}"] td:nth-of-type(2)`).should(rows => {
      if (assertTo) {
        expect(rows[0].firstElementChild.innerText.trim()).to.eq(GROUPED_PARSER_MARKER);
      } else {
        expect(rows[0].firstElementChild.innerText.trim()).to.not.eq(GROUPED_PARSER_MARKER);
      }
    });
  }

  const assertMarkedAsDeleted = (parserId, assertTo) => {
    cy.log(`Asserting ${parserId} is ${ !assertTo ? 'not' : '' } deleted`)
    cy.get(`[data-qe-id="parser-row-${parserId}"]`).should(rows => {
      expect(rows[0].classList.contains('deleted')).to.eq(assertTo);
    });
  }

  const assertListContains = (parserId, assertTo) => {
    const matcher = assertTo ? 'be.visible' : 'not.be.visible';
    cy.get(`[data-qe-id="parser-row-${parserId}"]`).should(matcher);
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

  it('Stopping bro__snort__yaf group', () => {
    cy.get(`[data-qe-id="parser-row-${PARSER_IDS.DEFAULT_GROUP}"] [data-qe-id="stop-parser-button"]`).click();

    assertConfirmMessageAppears('Stopped sensor bro__snort__yaf')

    cy.contains(`[data-qe-id="parser-row-${PARSER_IDS.DEFAULT_GROUP}"] td:nth-of-type(4)`, 'Stopped')
      .then(elements => expect(elements[0].innerText).to.eq('Stopped'));
  });


  it('Disassembling bro__snort__yaf group', () => {
    assertIsGroup(PARSER_IDS.BRO, true);
    assertIsGroup(PARSER_IDS.SNORT, true);
    assertIsGroup(PARSER_IDS.YAF, true);
    
    startDrag('bro');
    dragOver('jsonMapQuery', 'after');
    dropOn('jsonMapQuery');
    
    assertIsGroup(PARSER_IDS.BRO, false);

    startDrag('snort');
    dragOver('jsonMapQuery', 'after');
    dropOn('jsonMapQuery');
    
    assertIsGroup(PARSER_IDS.SNORT, false);

    startDrag('yaf');
    dragOver('jsonMapQuery', 'after');
    dropOn('jsonMapQuery');
    
    assertIsGroup(PARSER_IDS.YAF, false);

    cy.contains('button', 'APPLY').click();

    assertConfirmMessageAppears('Your changes has been applied successfully');
    
    cy.route('GET', '/api/v1/sensor/parser/config').as('getParserConfigs');
    cy.route('GET', '/api/v1/sensor/parser/group').as('getParserGroups');

    cy.reload();

    cy.log('Asserting parser/config API response');
    cy.wait('@getParserConfigs').should((xhr) => {
      const parserConfigs = xhr.response.body;
      
      expect(parserConfigs.bro.group).to.eq('');
      expect(parserConfigs.yaf.group).to.eq('');
      expect(parserConfigs.snort.group).to.eq('');
    });

    assertIsGroup(PARSER_IDS.BRO, false);
    assertIsGroup(PARSER_IDS.SNORT, false);
    assertIsGroup(PARSER_IDS.YAF, false);
  });

  it('Delete default bro__snort__yaf gropu', () => {
    cy.get(`[data-qe-id="parser-row-${PARSER_IDS.DEFAULT_GROUP}"] [data-qe-id="delete-parser-button"]`).click();

    // Asserting confirmation dialogue shows up
    cy.contains('Are you sure you want to delete bro__snort__yaf').should('be.visible');
    cy.wait(500);
    cy.contains('button', 'OK').click();

    assertMarkedAsDeleted(PARSER_IDS.DEFAULT_GROUP, true);

    cy.route('GET', '/api/v1/sensor/parser/group').as('getParserGroups');
    cy.contains('button', 'APPLY').click();
    cy.reload();
    cy.wait('@getParserGroups');

    assertListContains(PARSER_IDS.DEFAULT_GROUP, false);
  });

  it('Parser aggregate creation', () => {
    const testGroupName = 'Cypress-test-group';

    startDrag('snort');
    dropOn('bro');

    cy.get('input[type="text"]').first().clear().type(testGroupName);
    cy.get('input[type="text"]').last().type('Cypress-test-group-DESC');

    cy.contains('button', 'DONE').click();

    startDrag('yaf');
    dropOn(testGroupName);

    cy.route('GET', '/api/v1/sensor/parser/group').as('getParserGroups');
    cy.contains('button', 'APPLY').click();
    cy.reload();
    cy.wait('@getParserGroups');

    assertListContains(testGroupName, true);
  });


  /**
   * OTHER TESTABLES
   * 
   * - enable disable group
   * - enadble disable parser
   * 
   * - moving parser from an existing group to another (running too)
   */
});
