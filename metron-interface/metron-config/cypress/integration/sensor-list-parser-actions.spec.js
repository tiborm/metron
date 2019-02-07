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

describe('Sensor Config for parser e2e1', function() {

  beforeEach(function () {
    cy.login();
  });

  it('should start parsers from actions', () => {
    cy.wait('@config');
    cy.get('.metron-add-button.hexa-button .fa-plus').should('have.length', 1);
    cy.route('GET', '/api/v1/storm/parser/start/websphere', { 'status': 'SUCCESS', 'message': 'STARTED' });
    cy.route('GET', '/api/v1/storm', 'fixture:sensor-list-parser-actions/storm-after-start-websphere.json').as('storm');
    cy.get('[data-sensor-name="websphere"] .icon-container .fa-play:not([hidden])').click();
    cy.wait('@storm');
    cy.get('[data-sensor-name="websphere"] td:nth-child(3)').invoke('text').should(t => expect(t.trim()).to.equal('Running'));
  });

  it('should have correct values when parser is running', () => {
    cy.wait('@config');
    cy.get('.metron-add-button.hexa-button .fa-plus').should('have.length', 1);
    cy.route('GET', '/api/v1/storm/parser/start/websphere', { 'status': 'SUCCESS', 'message': 'STARTED' });
    cy.route('GET', '/api/v1/storm', 'fixture:sensor-list-parser-actions/storm-after-start-websphere.json').as('storm');
    cy.get('[data-sensor-name="websphere"] .icon-container .fa-play:not([hidden])').click();
    cy.wait('@storm');
    cy.get('[data-sensor-name="websphere"] td:nth-child(3)').invoke('text').should(t => expect(t.trim()).to.equal('Running'));
    cy.get('[data-sensor-name="websphere"] td:nth-child(4)').invoke('text').should(t => expect(t.trim()).to.equal('0ms'));
    cy.get('[data-sensor-name="websphere"] td:nth-child(5)').invoke('text').should(t => expect(t.trim()).to.equal('0kb/s'));
  });

  it('should stop all parsers from actions', () => {
    cy.wait('@config');
    cy.get('.metron-add-button.hexa-button .fa-plus').should('have.length', 1);
    cy.route('GET', '/api/v1/storm/parser/start/websphere', { 'status': 'SUCCESS', 'message': 'STARTED' });
    cy.route('GET', '/api/v1/storm/parser/stop/websphere', { 'status': 'SUCCESS', 'message': 'STOPPED' });
    cy.route('GET', '/api/v1/storm', 'fixture:sensor-list-parser-actions/storm-after-start-websphere.json').as('storm');
    cy.get('[data-sensor-name="websphere"] .icon-container .fa-play:not([hidden])').click();
    cy.wait('@storm');
    cy.route('GET', '/api/v1/storm', 'fixture:sensor-list-parser-actions/storm-after-stop-websphere.json').as('storm2');

    cy.get('[data-sensor-name="websphere"] td:nth-child(3)').invoke('text').should(t => expect(t.trim()).to.equal('Running'));
    cy.get('[data-sensor-name="websphere"] td:nth-child(4)').invoke('text').should(t => expect(t.trim()).to.equal('0ms'));
    cy.get('[data-sensor-name="websphere"] td:nth-child(5)').invoke('text').should(t => expect(t.trim()).to.equal('0kb/s'));

    cy.get('[data-sensor-name="websphere"] .icon-container .fa-stop:not([hidden])').click();

    cy.get('[data-sensor-name="websphere"] td:nth-child(3)').invoke('text').should(t => expect(t.trim()).to.equal('Stopped'));
    cy.get('[data-sensor-name="websphere"] td:nth-child(4)').invoke('text').should(t => expect(t.trim()).to.equal('-'));
    cy.get('[data-sensor-name="websphere"] td:nth-child(5)').invoke('text').should(t => expect(t.trim()).to.equal('-'));
  });

  it('should disable all parsers from actions', () => {
    cy.wait('@config');
    cy.get('.metron-add-button.hexa-button .fa-plus').should('have.length', 1);
    cy.route('GET', '/api/v1/storm/parser/start/websphere', { 'status': 'SUCCESS', 'message': 'STARTED' });
    cy.route('GET', '/api/v1/storm/parser/activate/websphere', { 'status': 'SUCCESS', 'message': 'ACTIVE' });
    cy.route('GET', '/api/v1/storm/parser/deactivate/websphere', { 'status': 'SUCCESS', 'message': 'STOPPED' });
    cy.route('GET', '/api/v1/storm', 'fixture:sensor-list-parser-actions/storm-after-start-websphere.json').as('storm');
    cy.get('[data-sensor-name="websphere"] .icon-container .fa-play:not([hidden])').click();
    cy.wait('@storm');
    cy.route('GET', '/api/v1/storm', 'fixture:sensor-list-parser-actions/storm-after-disable-websphere.json').as('storm2');
    cy.get('[data-sensor-name="websphere"] .icon-container .fa-ban:not([hidden])').click();
    cy.wait('@storm2');
    cy.route('GET', '/api/v1/storm', 'fixture:sensor-list-parser-actions/storm-after-enable-websphere.json').as('storm3');
    cy.get('[data-sensor-name="websphere"] td:nth-child(3)').invoke('text').should(t => expect(t.trim()).to.equal('Disabled'));
    cy.get('[data-sensor-name="websphere"] .icon-container .fa-check-circle-o:not([hidden])').click();
    cy.wait('@storm3');
    cy.get('[data-sensor-name="websphere"] td:nth-child(3)').invoke('text').should(t => expect(t.trim()).to.equal('Running'));
    cy.get('[data-sensor-name="websphere"] td:nth-child(4)').invoke('text').should(t => expect(t.trim()).to.equal('0ms'));
    cy.get('[data-sensor-name="websphere"] td:nth-child(5)').invoke('text').should(t => expect(t.trim()).to.equal('0kb/s'));
  });

  it('should start/stop from dropdown properly', () => {
    cy.wait('@config');
    cy.get('#websphere').click({ force: true });
    cy.get('.dropdown:not(.show)').click();
    cy.route('GET', '/api/v1/storm/parser/start/websphere', { 'status': 'SUCCESS', 'message': 'STARTED' });
    cy.route('GET', '/api/v1/storm/parser/stop/websphere', { 'status': 'SUCCESS', 'message': 'STOPPED' });
    cy.route('GET', '/api/v1/storm', 'fixture:sensor-list-parser-actions/storm-after-start-websphere.json').as('storm');
    cy.get('.dropdown.show .dropdown-menu [data-action="Start"]').click();
    cy.wait('@storm');
    cy.route('GET', '/api/v1/storm', 'fixture:sensor-list-parser-actions/storm-after-stop-websphere.json').as('storm2');
    cy.get('[data-sensor-name="websphere"] td:nth-child(3)').invoke('text').should(t => expect(t.trim()).to.equal('Running'));
    cy.get('[data-sensor-name="websphere"] td:nth-child(4)').invoke('text').should(t => expect(t.trim()).to.equal('0ms'));
    cy.get('[data-sensor-name="websphere"] td:nth-child(5)').invoke('text').should(t => expect(t.trim()).to.equal('0kb/s'));
    cy.get('[data-sensor-name="websphere"] .icon-container .fa-stop:not([hidden])').click();
    cy.wait('@storm2');
    cy.get('[data-sensor-name="websphere"] td:nth-child(3)').invoke('text').should(t => expect(t.trim()).to.equal('Stopped'));
    cy.get('[data-sensor-name="websphere"] td:nth-child(4)').invoke('text').should(t => expect(t.trim()).to.equal('-'));
    cy.get('[data-sensor-name="websphere"] td:nth-child(5)').invoke('text').should(t => expect(t.trim()).to.equal('-'));
  });


  it('should disable/enable from dropdown properly', () => {
    cy.wait('@config');
    cy.get('#websphere').click({ force: true });
    cy.get('.dropdown:not(.show)').click();
    cy.route('GET', '/api/v1/storm/parser/start/websphere', { 'status': 'SUCCESS', 'message': 'STARTED' });
    cy.route('GET', '/api/v1/storm/parser/deactivate/websphere', { 'status': 'SUCCESS', 'message': 'STOPPED' });
    cy.route('GET', '/api/v1/storm/parser/activate/websphere', { 'status': 'SUCCESS', 'message': 'ACTIVE' });
    cy.route('GET', '/api/v1/storm/parser/stop/websphere', { 'status': 'SUCCESS', 'message': 'STOPPED' });
    cy.route('GET', '/api/v1/storm', 'fixture:sensor-list-parser-actions/storm-after-start-websphere.json').as('storm');
    cy.get('.dropdown.show .dropdown-menu [data-action="Start"]').click();
    cy.wait('@storm');
    cy.route('GET', '/api/v1/storm', 'fixture:sensor-list-parser-actions/storm-after-disable-websphere.json').as('storm2');
    cy.get('[data-sensor-name="websphere"] td:nth-child(3)').invoke('text').should(t => expect(t.trim()).to.equal('Running'));
    cy.get('[data-sensor-name="websphere"] td:nth-child(4)').invoke('text').should(t => expect(t.trim()).to.equal('0ms'));
    cy.get('[data-sensor-name="websphere"] td:nth-child(5)').invoke('text').should(t => expect(t.trim()).to.equal('0kb/s'));
    cy.get('.dropdown:not(.show)').click();
    cy.get('.dropdown.show .dropdown-menu [data-action="Disable"]').click();
    cy.wait('@storm2');
    cy.route('GET', '/api/v1/storm', 'fixture:sensor-list-parser-actions/storm-after-enable-websphere.json').as('storm3');
    cy.get('[data-sensor-name="websphere"] td:nth-child(3)').invoke('text').should(t => expect(t.trim()).to.equal('Disabled'));
    cy.get('[data-sensor-name="websphere"] td:nth-child(4)').invoke('text').should(t => expect(t.trim()).to.equal('-'));
    cy.get('[data-sensor-name="websphere"] td:nth-child(5)').invoke('text').should(t => expect(t.trim()).to.equal('-'));
    cy.get('.dropdown:not(.show)').click();
    cy.get('.dropdown.show .dropdown-menu [data-action="Enable"]').click();
    cy.wait('@storm3');
    cy.route('GET', '/api/v1/storm', 'fixture:sensor-list-parser-actions/storm-after-stop-websphere.json').as('storm4');
    cy.get('[data-sensor-name="websphere"] td:nth-child(3)').invoke('text').should(t => expect(t.trim()).to.equal('Running'));
    cy.get('[data-sensor-name="websphere"] td:nth-child(4)').invoke('text').should(t => expect(t.trim()).to.equal('0ms'));
    cy.get('[data-sensor-name="websphere"] td:nth-child(5)').invoke('text').should(t => expect(t.trim()).to.equal('0kb/s'));
    cy.get('.dropdown:not(.show)').click();
    cy.get('.dropdown.show .dropdown-menu [data-action="Stop"]').click();
    cy.wait('@storm4');
    cy.get('[data-sensor-name="websphere"] td:nth-child(3)').invoke('text').should(t => expect(t.trim()).to.equal('Stopped'));
    cy.get('[data-sensor-name="websphere"] td:nth-child(4)').invoke('text').should(t => expect(t.trim()).to.equal('-'));
    cy.get('[data-sensor-name="websphere"] td:nth-child(5)').invoke('text').should(t => expect(t.trim()).to.equal('-'));
  });
});