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

describe('Sensor Config for parser e2e1', function() {

  beforeEach(function () {
    cy.login();
  });

  it('should add e2e parser', () => {

    cy.route('GET', '/api/v1/sensor/parser/config/list/available', 'fixture:sensor-config-single-parser/config-list-available.json');
    cy.route({
      method: 'GET',
      url: '/api/v1/kafka/topic/e2e1',
      status: 200,
      response: {
        name: "bro",
        numPartitions: 1,
        properties: {},
        replicationFactor: 1,
      }
    });
    cy.route({
      method: 'GET',
      url: '/api/v1/kafka/topic/e2e1/sample',
      status: 200,
      response: '"it has length"'
    }).as('sample');
    cy.route({
      method: 'POST',
      url: '/api/v1/sensor/parser/config/parseMessage',
      status: 200,
      response: {}
    });
    cy.get('.metron-add-button.hexa-button').click();
    cy.get('input[name="sensorName"]').type('e2e1');
    cy.get('input[name="sensorTopic"]').type('e2e1');
    cy.get('select[formcontrolname="parserClassName"]').select('Grok');
    cy.wait('@sample').get('input[formcontrolname="grokStatement"] + span').click();

    const sampleMessage = '1467011157.401 415 127.0.0.1 TCP_MISS/200 337891 GET http://www.aliexpress.com/af/shoes.html? - DIRECT/207.109.73.154 text/html';
    const grokStatement = '%{{}NUMBER:timestamp} %{{}INT:elapsed} %{{}IPV4:ip_src_addr} %{{}WORD:action}/%{{}NUMBER:code} %{{}NUMBER:bytes} %{{}WORD:method} %{{}NOTSPACE:url} - %{{}WORD:UNWANTED}\/%{{}IPV4:ip_dst_addr} %{{}WORD:UNWANTED}\/%{{}WORD:UNWANTED}';
    cy.get('metron-config-sensor-grok .form-control.sample-input').type(sampleMessage);
    cy.get('metron-config-sensor-grok .ace_text-input').type(grokStatement, { force: true }).type(' ', { force: true });
    cy.get('metron-config-sensor-grok .ace_text-input').focus();
    cy.get('metron-config-sensor-grok button').contains('TEST').click();
  });
});