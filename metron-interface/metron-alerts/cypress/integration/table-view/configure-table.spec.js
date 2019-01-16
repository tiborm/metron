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

    cy.route('POST', '/api/v1/search/column/metadata', 'fixture:column.metadata.json');


    cy.visit('login');
    cy.get('[name="user"]').type('user');
    cy.get('[name="password"]').type('password');
    cy.contains('LOG IN').click();
  });

  afterEach(() => {
  });

  it('select column from table configuration', () => {
    cy.get('#actions').should('not.be.visible');
    cy.get('#active_files').should('not.be.visible');

    cy.get('.btn.cog > .configure-table-icon').click()

    cy.get('app-configure-table table tbody tr:nth-child(4) input[type="checkbox"]').check({ force: true });
    cy.get('app-configure-table table tbody tr:nth-child(6) input[type="checkbox"]').check({ force: true });

    cy.contains('SAVE').click();

    cy.get('#actions').should('be.visible');
    cy.get('#active_files').should('be.visible');
  });

  it('renaming and adding column', () => {
    cy.contains('renamed_actions').should('not.be.visible');

    cy.get('.btn.cog > .configure-table-icon').click()

    cy.get('app-configure-table table tbody tr:nth-child(4) input[placeholder="rename"]').type('renamed_actions');

    cy.get('app-configure-table table tbody tr:nth-child(4) input[type="checkbox"]').check({ force: true });

    cy.contains('SAVE').click();

    cy.contains('renamed_actions').should('be.visible');
  });

  it('renaming column previusly added to the table', () => {
    cy.contains('renamed_Score').should('not.be.visible');

    cy.get('.btn.cog > .configure-table-icon').click()

    cy.get('app-configure-table table tbody tr:nth-child(18) input[placeholder="rename"]').type('renamed_Score');

    cy.contains('SAVE').click();

    cy.contains('renamed_Score').should('be.visible');
  });

  it('removing column', () => {
    cy.contains('guid').should('be.visible');

    cy.get('.btn.cog > .configure-table-icon').click()

    cy.get('app-configure-table table tbody tr:nth-child(18) input[type="checkbox"]').uncheck({ force: true });

    cy.contains('SAVE').click();

    cy.contains('guid').should('not.be.visible');
  })

});
