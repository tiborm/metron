export function login() {
  cy.visit('localhost:4200');
  cy.get('[name=user]').type('user')
  cy.get('[name=password]').type('password')
  cy.get('button[type="submit"]').click()
}

export function logout() {
  cy.get('.logout-link').click()
}