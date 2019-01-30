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

describe('Sensor List', function() {

  beforeEach(function () {
    cy.login();
  });

  it('should have title defined', () => {
    cy.get('.metron-title').invoke('text').should(t => expect(t.trim()).to.equal('Sensors (11)'));
  });

  it('should have add button', () => {
    cy.get('.metron-add-button.hexa-button .fa-plus').should('have.length', 1);
  });

  it('should have all the default parsers', () => {
    cy.get('table > tbody > tr').should('have.length', 11);
  });

  it('should have all the table headers', () => {
    const headers = ['Name', 'Parser', 'Status', 'Latency', 'Throughput', 'Last Updated', 'Last Editor'];
    cy.get('table th a').each((el, i) => {
      expect(el.text().trim()).to.equal(headers[i]);
    });
  });

  it('should sort table content by name asc', () => {
    cy.get('table th a').contains('Name').click();
    cy.get('table th a').contains('Name').find('i').should('have.class', 'fa-sort-asc');
    const actual = [];
    cy.get('table tbody tr td:first-child')
      .each((el) => actual.push(el.text().trim()))
      .then(() => {
        expect(actual).to.eql(['asa', 'bro', 'jsonMap', 'jsonMapQuery', 'jsonMapWrappedQuery', 'snort', 'squid', 'syslog3164', 'syslog5424', 'websphere', 'yaf']);
      });
  });

  it('should sort table content by name desc', () => {
    cy.get('table th a').contains('Name').click();
    cy.get('table th a').contains('Name').click();
    cy.get('table th a').contains('Name').find('i').should('have.class', 'fa-sort-desc');
    const actual = [];
    cy.get('table tbody tr td:first-child')
      .each((el) => actual.push(el.text().trim()))
      .then(() => {
        expect(actual).to.eql(['yaf', 'websphere', 'syslog5424', 'syslog3164', 'squid', 'snort', 'jsonMapWrappedQuery', 'jsonMapQuery', 'jsonMap', 'bro', 'asa']);
      });
  });

  it('should sort table content by parser asc', () => {
    cy.get('table th a').contains('Parser').click();
    cy.get('table th a').contains('Parser').find('i').should('have.class', 'fa-sort-asc');
    const actual = [];
    cy.get('table tbody tr td:nth-child(2)')
      .each((el) => actual.push(el.text().trim()))
      .then(() => {
        expect(actual).to.eql(['Asa', 'Bro', 'Grok', 'Grok', 'GrokWebSphere', 'JSONMap', 'JSONMap', 'JSONMap', 'Snort', 'Syslog3164', 'Syslog5424']);
      });
  });

  it('should sort table content by parser desc', () => {
    cy.get('table th a').contains('Parser').click();
    cy.get('table th a').contains('Parser').click();
    cy.get('table th a').contains('Parser').find('i').should('have.class', 'fa-sort-desc');
    const actual = [];
    cy.get('table tbody tr td:nth-child(2)')
      .each((el) => actual.push(el.text().trim()))
      .then(() => {
        expect(actual).to.eql(['Syslog5424', 'Syslog3164', 'Snort', 'JSONMap', 'JSONMap', 'JSONMap', 'GrokWebSphere', 'Grok', 'Grok', 'Bro', 'Asa']);
      });
  });

  it('should select deselect all rows', () => {
    cy.get('label[for="select-deselect-all"]').click();
    cy.get('tr.active').should('have.length', 11);
    cy.get('label[for="select-deselect-all"]').click();
    cy.get('tr.active').should('have.length', 0);
  });

  it('should select deselect individual rows', () => {
    ['websphere', 'jsonMap', 'squid', 'asa', 'snort', 'bro', 'yaf'].map(name => {
      cy.get('label[for=\"' + name + '\"]').click();
      cy.get('tr.active').should('have.length', 1);
      cy.get('label[for=\"' + name + '\"]').click();
      cy.get('tr.active').should('have.length', 0);
    });
  });

  it('should enable action in dropdown', () => {
    cy.get('.dropdown.show .dropdown-item:not(.disabled)').should('have.length', 0);
    cy.get('.dropdown.show .dropdown-item.disabled').should('have.length', 0);
    cy.get('.dropdown-menu').should('not.be.visible');

    cy.get('#dropdownMenu1').click();

    cy.get('.dropdown.show .dropdown-item:not(.disabled)').should('have.length', 0);
    cy.get('.dropdown.show .dropdown-item.disabled').should('have.length', 5);
    cy.get('.dropdown-menu').should('be.visible');

    cy.get('#dropdownMenu1').click();

    cy.get('label[for="select-deselect-all"]').click();

    cy.get('#dropdownMenu1').click();

    cy.get('.dropdown.show .dropdown-item:not(.disabled)').should('have.length', 5);
    cy.get('.dropdown.show .dropdown-item.disabled').should('have.length', 0);
    cy.get('.dropdown-menu').should('be.visible');
  });

  it('should have all the actions with default value', () => {

    cy.wait('@config');

    cy.get('table > tbody > tr > td.icon-container').each(iconContainer => {
      cy.wrap(iconContainer.find('.fa-circle-o-notch')).should('not.be.visible');
      cy.wrap(iconContainer.find('.fa-stop')).should('not.be.visible');
      cy.wrap(iconContainer.find('.fa-ban')).should('not.be.visible');
      cy.wrap(iconContainer.find('.fa-play')).should('be.visible');
      cy.wrap(iconContainer.find('.fa-check-circle-o')).should('not.be.visible');
      cy.wrap(iconContainer.find('.fa-pencil')).should('be.visible');
      cy.wrap(iconContainer.find('.fa-trash-o')).should('be.visible');
    });
  });

  it('should open the details pane', () => {
    cy.location('pathname').should('eq', '/sensors');
    ['websphere', 'jsonMap', 'squid', 'asa', 'snort', 'bro', 'yaf'].map((name) => {
      cy.get('[data-sensor-name="' + name + '"]').click();

    });
  });

  it('should open the edit pane', () => {
    ['websphere', 'jsonMap', 'squid', 'asa', 'snort', 'bro', 'yaf'].map((name) => {
      cy.get('[data-sensor-name="' + name + '"]').find('.fa-pencil').click();
      cy.location('pathname').should('eq', '/sensors(dialog:sensors-config/' + name +')');
      cy.get('.metron-slider-pane-edit:visible .close-button').click();
    });
  });
});