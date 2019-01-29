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

describe('Application Skeleton', function() {

  beforeEach(function () {
    cy.login();
  });

  it('should have metron logo', () => {
    cy.get('.navbar-brand').should('have.length', 1);
  });

  it('should have navigations', () => {
    cy.get('.navigation .nav-link-title')
      .invoke('text')
      .should(t => expect(t.trim()).to.equal('Operations'));

    ['Sensors', 'General Settings']
      .map((navItemText, i) => {
        cy.get('.navigation .nav-item')
        .eq(i)
        .invoke('text')
        .should(t => expect(t.trim()).to.equal(navItemText));
      });
  });

  it('should navigate to all pages', () => {
    cy
      .get('.navigation .nav-link')
      .contains('General Settings')
      .click();

    cy.location('pathname').should('eq', '/general-settings');

    cy
      .get('.navigation .nav-link')
      .contains('Sensors')
      .click();

    cy.location('pathname').should('eq', '/sensors');
  });
});