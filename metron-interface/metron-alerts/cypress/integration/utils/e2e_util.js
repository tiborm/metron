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

export function loadTestData() {
  let template, data;
  cy.request('DELETE', 'http://node1:9200/alerts_ui_e2e_index*');
  cy.readFile('e2e/mock-data/alerts_ui_e2e_index.template', 'utf8').then(
    json => {
      template = json;
      cy.request({
        url: 'http://node1:9200/_template/alerts_ui_e2e_index',
        method: 'POST',
        body: template
      });
    }
  );
  cy.readFile('e2e/mock-data/alerts_ui_e2e_index.data', 'utf8').then(json => {
    data = json;
    cy.request({
      url: 'http://node1:9200/alerts_ui_e2e_index/alerts_ui_e2e_doc/_bulk',
      method: 'POST',
      body: data
    });
  });
}

export function deleteTestData() {
  cy.request('DELETE', 'http://node1:9200/alerts_ui_e2e_index*');
}

export function reduceForGetAll() {
  return (acc, elem) => {
    return elem
      .getText()
      .then(function(text) {
        acc.push(text);
        return acc;
      })
      .catch(e => console.log(e));
  };
}
