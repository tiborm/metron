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
