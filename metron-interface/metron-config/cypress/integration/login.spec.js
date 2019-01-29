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

describe('Test spec for login page', function() {

  beforeEach(function () {
    cy.server();
    cy.visit('login');
  });

  it('should display error message for invalid credentials', () => {
    cy.route({
      method: 'GET',
      url: '/api/v1/user',
      status: 401,
      response: {}
    });
    cy.get('[name="user"]').type('admin');
    cy.get('[name="password"]').type('admin{enter}');
    cy.get('[data-qe-id="error-message"]')
      .invoke('text').should(t => expect(t.trim()).to.equal('Login failed for admin'));
  });

  it('should login for valid credentials', () => {
    cy.route({
      method: 'GET',
      url: '/api/v1/user',
      status: 200,
      response: {}
    });
    cy.get('[name="user"]').type('user');
    cy.get('[name="password"]').type('password{enter}');
    cy.location('pathname').should('eq', '/sensors');
  });

  it('should logout', () => {
    cy.route({
      method: 'GET',
      url: '/api/v1/user',
      status: 200,
      response: {}
    });
    cy.get('[name="user"]').type('user');
    cy.get('[name="password"]').type('password{enter}');
    cy.get('.logout-link').click();
    cy.location('pathname').should('eq', '/login');
  });
});