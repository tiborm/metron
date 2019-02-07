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

describe('Sensor Details View', function() {

  beforeEach(function () {
    cy.login();
  });

  it('should have squid attributes defined', () => {

    cy.wait('@config');
    cy.route('GET', '/api/v1/sensor/parser/config/websphere', 'fixture:sensor-config-readonly/parser-config-websphere.json');
    cy.route('GET', '/api/v1/sensor/enrichment/config/websphere', 'fixture:sensor-config-readonly/enrichment-websphere.json');
    cy.route('GET', '/api/v1/storm', [{"id":"enrichment-1-1549379317","name":"enrichment","status":"ACTIVE","latency":1813.427,"throughput":7.588333333333333,"emitted":13882,"acked":4553},{"id":"random_access_indexing-6-1549379763","name":"random_access_indexing","status":"ACTIVE","latency":44.473,"throughput":7.58,"emitted":4600,"acked":4548},{"id":"batch_indexing-5-1549379708","name":"batch_indexing","status":"ACTIVE","latency":637.103,"throughput":7.54,"emitted":4435,"acked":4524},{"id":"bro__snort__yaf-4-1549379622","name":"bro__snort__yaf","status":"ACTIVE","latency":2674.752,"throughput":7.571666666666666,"emitted":4610,"acked":4543},{"id":"pcap-2-1549379385","name":"pcap","status":"ACTIVE","latency":0.0,"throughput":0.0,"emitted":0,"acked":0},{"id":"profiler-3-1549379477","name":"profiler","status":"ACTIVE","latency":3.728,"throughput":7.601666666666667,"emitted":4440,"acked":4561}]);
    cy.route('GET', '/api/v1/grok/get/statement?path=/patterns/websphere', {});
    cy.get('[data-sensor-name="websphere"]').click();
    cy.location('pathname').should('eq', '/sensors(dialog:sensors-readonly/websphere)');
    cy.get('metron-config-sensor-parser-readonly .form-title').invoke('text').should(t => expect(t.trim()).to.equal('websphere'));

    const labels = [
      'PARSER',
      'LAST UPDATED',
      'LAST EDITOR',
      'STATE',
      'ORIGINATOR',
      'CREATION DATE',
      'STORM',
      'LATENCY',
      'THROUGHPUT',
      'EMITTED(10 MIN)',
      'ACKED(10 MIN)',
      'NUM WORKERS',
      'NUM ACKERS',
      'SPOUT PARALLELISM',
      'SPOUT NUM TASKS',
      'PARSER PARALLELISM',
      'PARSER NUM TASKS',
      'ERROR WRITER PARALLELISM',
      'ERROR NUM TASKS',
      'KAFKA',
      'PARTITONS',
      'REPLICATION FACTOR',
      '-',
      'AGGREGATOR',
      ''
    ];
    cy.get('metron-config-sensor-parser-readonly .row .form-label').each((el, i) => {
      cy.wrap(el).invoke('text').should(t => expect(t.trim()).to.equal(labels[i]));
    });

    const values = [
      'GrokWebSphere',
      '-',
      '-',
      '-',
      '-',
      '-',
      'STORM',
      'Stopped',
      '-',
      '-',
      '-',
      '-',
      '-',
      '-',
      '1',
      '1',
      '1',
      '1',
      '1',
      '1',
      'KAFKA',
      'No Kafka Topic',
      '-',
      '-',
      'Transforms',
      'MAX',
      'NAMESCORE',
    ]

    cy.get('metron-config-sensor-parser-readonly .row .form-value').each((el, i) => {
      cy.wrap(el).invoke('text').should(t => expect(t.trim()).to.equal(values[i]));
    });

    cy.get('metron-config-sensor-parser-readonly button').contains('EDIT').should('be.visible');
    cy.get('metron-config-sensor-parser-readonly button').contains('START').should('be.visible');
    cy.get('metron-config-sensor-parser-readonly button').contains('Delete').should('be.visible');

    cy.route('GET', '/api/v1/storm/parser/start/websphere', {"status":"SUCCESS","message":"STARTED"});
    cy.route('GET', '/api/v1/storm/websphere', 'fixture:sensor-config-readonly/storm-websphere-after-start.json');
    cy.get('metron-config-sensor-parser-readonly button').contains('START').click();

    cy.get('metron-config-sensor-parser-readonly button').contains('EDIT').should('be.visible');
    cy.get('metron-config-sensor-parser-readonly button').contains('STOP').should('be.visible');
    cy.get('metron-config-sensor-parser-readonly button').contains('DISABLE').should('be.visible');
    cy.get('metron-config-sensor-parser-readonly button').contains('Delete').should('be.visible');

    cy.route('GET', '/api/v1/storm/parser/deactivate/websphere', {"status":"SUCCESS","message":"INACTIVE"});
    cy.route('GET', '/api/v1/storm/websphere', 'fixture:sensor-config-readonly/storm-websphere-after-disable.json');
    cy.get('metron-config-sensor-parser-readonly button').contains('DISABLE').click();

    cy.get('metron-config-sensor-parser-readonly button').contains('EDIT').should('be.visible');
    cy.get('metron-config-sensor-parser-readonly button').contains('STOP').should('be.visible');
    cy.get('metron-config-sensor-parser-readonly button').contains('ENABLE').should('be.visible');
    cy.get('metron-config-sensor-parser-readonly button').contains('Delete').should('be.visible');

    cy.route('GET', '/api/v1/storm/parser/activate/websphere', {"status":"SUCCESS","message":"ACTIVE"});
    cy.route('GET', '/api/v1/storm/websphere', 'fixture:sensor-config-readonly/storm-websphere-after-enable.json');
    cy.get('metron-config-sensor-parser-readonly button').contains('ENABLE').click();

    cy.get('metron-config-sensor-parser-readonly button').contains('EDIT').should('be.visible');
    cy.get('metron-config-sensor-parser-readonly button').contains('STOP').should('be.visible');
    cy.get('metron-config-sensor-parser-readonly button').contains('DISABLE').should('be.visible');
    cy.get('metron-config-sensor-parser-readonly button').contains('Delete').should('be.visible');

    cy.route('GET', '/api/v1/storm/parser/stop/websphere', {"status":"SUCCESS","message":"STOPPED"});
    cy.route('GET', '/api/v1/storm/websphere', 'fixture:sensor-config-readonly/storm-websphere-after-stop.json');
    cy.get('metron-config-sensor-parser-readonly button').contains('STOP').click();

    cy.get('metron-config-sensor-parser-readonly button').contains('EDIT').should('be.visible');
    cy.get('metron-config-sensor-parser-readonly button').contains('START').should('be.visible');
    cy.get('metron-config-sensor-parser-readonly button').contains('Delete').should('be.visible');
  });
});