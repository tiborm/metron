describe('Test spec for login page', function() {

    beforeEach(function () {
        let template, data;
        cy.request('DELETE','http://node1:9200/alerts_ui_e2e_index*');
        cy.readFile('e2e/mock-data/alerts_ui_e2e_index.template', 'utf8').then((json) => {
            template = json;
            cy.request({
                url: 'http://node1:9200/_template/alerts_ui_e2e_index',
                method: 'POST',
                body: template
            })
          })
        cy.readFile('e2e/mock-data/alerts_ui_e2e_index.data', 'utf8').then((json) => {
            data = json;
            cy.request({
                url: 'http://node1:9200/alerts_ui_e2e_index/alerts_ui_e2e_doc/_bulk',
                method: 'POST',
                body: data
            })
        })
    });

    afterEach(function () {
        cy.request('DELETE','http://node1:9200/alerts_ui_e2e_index*')
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
