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

import { loadTestData, deleteTestData } from '../utils/e2e_util';

describe('Test spec for login page', function() {

  beforeEach(function () {
    loadTestData();
  });

  afterEach(function () {
    deleteTestData();
  })

  it('should display error message for invalid credentials', () => {
    cy.visit('localhost:4200');
    cy.get('[name=user]').type('admin')
    cy.get('[name=password]').type('admin')
    cy.get('button[type="submit"]').click()
    cy.get('.login-failed-msg').should('contain', 'Login failed for admin')
  });

  it('should login for valid credentials', () =>  {
    cy.visit('localhost:4200');
    cy.get('[name=user]').type('admin')
    cy.get('[name=password]').type('password')
    cy.get('button[type="submit"]').click()
    cy.url().should('eq', 'http://localhost:4200/alerts-list')
  });

  it('should logout', () => {
    cy.get('.logout-link').click()
    cy.url().should('eq', 'http://localhost:4200/login')
  });
});
