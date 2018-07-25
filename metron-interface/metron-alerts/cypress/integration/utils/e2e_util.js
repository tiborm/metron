export function loadTestData() {
  let template, data;
  cy.request('DELETE','http://node1:9200/alerts_ui_e2e_index*');
  cy.readFile('e2e/mock-data/alerts_ui_e2e_index.template', 'utf8').then((json) => {
      template = json;
      cy.request({
          url: 'http://node1:9200/_template/alerts_ui_e2e_index',
          method: 'POST',
          body: template
      })
    });
  cy.readFile('e2e/mock-data/alerts_ui_e2e_index.data', 'utf8').then((json) => {
      data = json;
      cy.request({
          url: 'http://node1:9200/alerts_ui_e2e_index/alerts_ui_e2e_doc/_bulk',
          method: 'POST',
          body: data
      })
  });
}

export function deleteTestData() {
  cy.request('DELETE','http://node1:9200/alerts_ui_e2e_index*');
}