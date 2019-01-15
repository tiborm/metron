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
context('Alert Table View', () => {

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
    cy.route('POST', 'search', 'fixture:search.json').as('searchRequest');

    cy.visit('login');
    cy.get('[name="user"]').type('user');
    cy.get('[name="password"]').type('password');
    cy.contains('LOG IN').click();
  });

  afterEach(() => {
  });

  it('sorting by timestamp column ASC', () => {
    cy.wait(500);

    cy.route({
      method: 'POST',
      url: '/api/v1/search/search',
      response: 'fixture:search.json'
    }).as('sortRequest-timestamp-asc');

    cy.get('#timestamp').click();
    cy.wait('@sortRequest-timestamp-asc').then((xhr) => {
      expect(xhr.request.body).to.have.property('sort');
      expect(xhr.request.body.sort).to.eqls([{field: "timestamp", sortOrder: "asc"}]);
    });
  });

  it('sorting by timestamp column DESC', () => {
    cy.wait(500);

    cy.get('#timestamp').click();
    cy.wait(100);

    cy.route({
      method: 'POST',
      url: '/api/v1/search/search',
      response: 'fixture:search.json'
    }).as('sortRequest-timestamp-dsc');

    cy.get('#timestamp').click();

    cy.wait('@sortRequest-timestamp-dsc').then((xhr) => {
      expect(xhr.request.body).to.have.property('sort');
      expect(xhr.request.body.sort).to.eqls([{field: "timestamp", sortOrder: "desc"}]);
    });
  });

  it('sorting by ip_dst_addr column ASC', () => {
    cy.wait(500);

    cy.route({
      method: 'POST',
      url: '/api/v1/search/search',
      response: 'fixture:search.json'
    }).as('sortRequest-ip_dst_addr-asc');

    cy.get('#ip_dst_addr').click();
    cy.wait('@sortRequest-ip_dst_addr-asc').then((xhr) => {
      expect(xhr.request.body).to.have.property('sort');
      expect(xhr.request.body.sort).to.eqls([{field: "ip_dst_addr", sortOrder: "asc"}]);
    });
  });

  it('sorting by ip_dst_addr column DESC', () => {
    cy.wait(500);

    cy.get('#ip_dst_addr').click();
    cy.wait(100);

    cy.route({
      method: 'POST',
      url: '/api/v1/search/search',
      response: 'fixture:search.json'
    }).as('sortRequest-ip_dst_addr-dsc');

    cy.get('#ip_dst_addr').click();

    cy.wait('@sortRequest-ip_dst_addr-dsc').then((xhr) => {
      expect(xhr.request.body).to.have.property('sort');
      expect(xhr.request.body.sort).to.eqls([{field: "ip_dst_addr", sortOrder: "desc"}]);
    });
  });
});
