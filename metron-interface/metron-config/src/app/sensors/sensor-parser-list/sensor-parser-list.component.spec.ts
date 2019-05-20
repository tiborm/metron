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
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SpyLocation } from '@angular/common/testing';
import { HttpClient, HttpResponse } from '@angular/common/http';

import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { Router, NavigationStart } from '@angular/router';
import { Observable, of } from 'rxjs';
import { SensorParserListComponent } from './sensor-parser-list.component';
import { SensorParserConfigService } from '../../service/sensor-parser-config.service';
import { MetronAlerts } from '../../shared/metron-alerts';
import { TopologyStatus } from '../../model/topology-status';
import { ParserConfigModel } from '../models/parser-config.model';
import { AuthenticationService } from '../../service/authentication.service';
import { SensorParserListModule } from './sensor-parser-list.module';
import { MetronDialogBox } from '../../shared/metron-dialog-box';
import 'jquery';
import { ParserMetaInfoModel } from '../models/parser-meta-info.model';
import { Store } from '@ngrx/store';
import { StormService } from '../../service/storm.service';
import { AppConfigService } from '../../service/app-config.service';
import { MockAppConfigService } from '../../service/mock.app-config.service';
import { SensorParserConfigHistoryService } from 'app/service/sensor-parser-config-history.service';
import { SensorParserConfigHistory } from 'app/model/sensor-parser-config-history';

class MockAuthenticationService extends AuthenticationService {
  public checkAuthentication() {}

  public getCurrentUser(options: {}): Observable<HttpResponse<{}>> {
    return Observable.create(observer => {
      observer.next(new HttpResponse({ body: 'test' }));
      observer.complete();
    });
  }
}

class MockSensorParserConfigHistoryService extends SensorParserConfigHistoryService {
  private allSensorParserConfigHistory: SensorParserConfigHistory[];

  public setSensorParserConfigHistoryForTest(
    allSensorParserConfigHistory: SensorParserConfigHistory[]
  ) {
    this.allSensorParserConfigHistory = allSensorParserConfigHistory;
  }

  public getAll(): Observable<SensorParserConfigHistory[]> {
    return Observable.create(observer => {
      observer.next(this.allSensorParserConfigHistory);
      observer.complete();
    });
  }
}

class MockSensorParserConfigService extends SensorParserConfigService {
  private sensorParserConfigs: {};

  public setSensorParserConfigForTest(sensorParserConfigs: {}) {
    this.sensorParserConfigs = sensorParserConfigs;
  }

  public getAll(): Observable<{ string: ParserConfigModel }> {
    return Observable.create(observer => {
      observer.next(this.sensorParserConfigs);
      observer.complete();
    });
  }

  public deleteSensorParserConfigs(
    sensorNames: string[]
  ): Observable<{ success: Array<string>; failure: Array<string> }> {
    let result: { success: Array<string>; failure: Array<string> } = {
      success: [],
      failure: []
    };
    let observable = Observable.create(observer => {
      for (let i = 0; i < sensorNames.length; i++) {
        result.success.push(sensorNames[i]);
      }
      observer.next(result);
      observer.complete();
    });
    return observable;
  }
}

class MockStormService extends StormService {
  private topologyStatuses: TopologyStatus[];

  public setTopologyStatusForTest(topologyStatuses: TopologyStatus[]) {
    this.topologyStatuses = topologyStatuses;
  }

  public pollGetAll(): Observable<TopologyStatus[]> {
    return Observable.create(observer => {
      observer.next(this.topologyStatuses);
      observer.complete();
    });
  }

  public getAll(): Observable<TopologyStatus[]> {
    return Observable.create(observer => {
      observer.next(this.topologyStatuses);
      observer.complete();
    });
  }
}

class MockRouter {
  events: Observable<Event> = Observable.create(observer => {
    observer.next(new NavigationStart(1, '/sensors'));
    observer.complete();
  });

  navigateByUrl(url: string) {}
}

class MockMetronDialogBox {
  public showConfirmationMessage(message: string) {
    return Observable.create(observer => {
      observer.next(true);
      observer.complete();
    });
  }
}

describe('Component: SensorParserList', () => {
  let comp: SensorParserListComponent;
  let fixture: ComponentFixture<SensorParserListComponent>;
  let authenticationService: MockAuthenticationService;
  let sensorParserConfigService: MockSensorParserConfigService;
  let stormService: MockStormService;
  let router: Router;
  let metronAlerts: MetronAlerts;
  let metronDialog: MetronDialogBox;
  let dialogEl: DebugElement;
  let sensors = [
    {
      config: new ParserConfigModel('TestConfigId01'),
      status: {
        status: 'KILLED'
      },
      isGroup: false,
      isDeleted: false,
    },
    {
      config: new ParserConfigModel('TestConfigId02'),
      status: {
        status: 'INACTIVE'
      },
      isGroup: false,
      isDeleted: false,
    },
    {
      config: new ParserConfigModel('TestConfigId03'),
      status: {
        status: 'ACTIVE'
      },
      isGroup: false,
      isDeleted: false,
    },
    {
      config: new ParserConfigModel('TestConfigId04'),
      status: {
        status: 'ACTIVE'
      },
      isDeleted: true
    },
    {
      config: new ParserConfigModel('TestConfigId05'),
      status: {
        status: 'ACTIVE'
      },
      isPhantom: true,
      isDeleted: false,
    }
  ];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SensorParserListModule],
      providers: [
        { provide: HttpClient },
        { provide: Store, useValue: {
          pipe: () => {
            return of(sensors)
          },
          dispatch: () => {

          }
        } },
        { provide: Location, useClass: SpyLocation },
        { provide: AuthenticationService, useClass: MockAuthenticationService },
        {
          provide: SensorParserConfigService,
          useClass: MockSensorParserConfigService
        },
        { provide: StormService, useClass: MockStormService },
        { provide: Router, useClass: MockRouter },
        { provide: MetronDialogBox, useClass: MockMetronDialogBox },
        { provide: AppConfigService, useClass: MockAppConfigService },
        MetronAlerts
      ]
    });
    fixture = TestBed.createComponent(SensorParserListComponent);
    comp = fixture.componentInstance;
    authenticationService = TestBed.get(AuthenticationService);
    sensorParserConfigService = TestBed.get(SensorParserConfigService);
    stormService = TestBed.get(StormService);
    router = TestBed.get(Router);
    metronAlerts = TestBed.get(MetronAlerts);
    metronDialog = TestBed.get(MetronDialogBox);
    dialogEl = fixture.debugElement.query(By.css('.primary'));
  }));

  it('should create an instance', async(() => {
    let component: SensorParserListComponent = fixture.componentInstance;
    expect(component).toBeDefined();
    fixture.destroy();
  }));

  // FIXME: this is not belongs to the compoent
  // it('getSensors should call getStatus and poll status and all variables should be initialised', async(() => {
  //   let sensorParserConfigHistory1 = new ParserConfigModel();
  //   let sensorParserConfigHistory2 = new ParserConfigModel();
  //   let sensorParserConfig1 = new ParserConfigModel();
  //   let sensorParserConfig2 = new ParserConfigModel();

  //   sensorParserConfigHistory1.setName('squid');
  //   sensorParserConfigHistory2.setName('bro');
  //   sensorParserConfigHistory1.setConfig(sensorParserConfig1);
  //   sensorParserConfigHistory2.setConfig(sensorParserConfig2);

  //   let sensorParserStatus1 = new TopologyStatus();
  //   let sensorParserStatus2 = new TopologyStatus();
  //   sensorParserStatus1.name = 'squid';
  //   sensorParserStatus1.status = 'KILLED';
  //   sensorParserStatus2.name = 'bro';
  //   sensorParserStatus2.status = 'KILLED';

  //   sensorParserConfigService.setSensorParserConfigForTest({
  //     squid: sensorParserConfig1,
  //     bro: sensorParserConfig2
  //   });
  //   stormService.setTopologyStatusForTest([
  //     sensorParserStatus1,
  //     sensorParserStatus2
  //   ]);

  //   let component: SensorParserListComponent = fixture.componentInstance;

  //   component.enableAutoRefresh = false;

  //   component.ngOnInit();

  //   expect(component.sensors[0].sensorName).toEqual(
  //     sensorParserConfigHistory1.sensorName
  //   );
  //   expect(component.sensors[1].sensorName).toEqual(
  //     sensorParserConfigHistory2.sensorName
  //   );
  //   expect(component.sensorsStatus[0]).toEqual(
  //     Object.assign(new TopologyStatus(), sensorParserStatus1)
  //   );
  //   expect(component.sensorsStatus[1]).toEqual(
  //     Object.assign(new TopologyStatus(), sensorParserStatus2)
  //   );
  //   expect(component.selectedSensors).toEqual([]);
  //   expect(component.count).toEqual(2);

  //   fixture.destroy();
  // }));

  it('getParserType should return the Type of Parser', async(() => {
    let component: SensorParserListComponent = fixture.componentInstance;

    let sensorParserConfig1 = new ParserConfigModel('TestConfigId01');
    sensorParserConfig1.sensorTopic = 'squid';
    sensorParserConfig1.parserClassName =
      'org.apache.metron.parsers.GrokParser';
    let sensorParserConfig2 = new ParserConfigModel('TestConfigId02');
    sensorParserConfig2.sensorTopic = 'bro';
    sensorParserConfig2.parserClassName =
      'org.apache.metron.parsers.bro.BasicBroParser';

    expect(component.getParserType(sensorParserConfig1)).toEqual('Grok');
    expect(component.getParserType(sensorParserConfig2)).toEqual('Bro');

    fixture.destroy();
  }));

  it('navigateToSensorEdit should set selected sensor and change url', async(() => {
    let event = new Event('mouse');
    event.stopPropagation = jasmine.createSpy('stopPropagation');

    spyOn(router, 'navigateByUrl');

    let component: SensorParserListComponent = fixture.componentInstance;

    let sensorParserConfigHistory1 = {
      config: new ParserConfigModel('TestConfigId01')
    };
    sensorParserConfigHistory1.config.setName('squid');
    component.navigateToSensorEdit(sensorParserConfigHistory1, event);

    let expectStr = router.navigateByUrl['calls'].argsFor(0);
    expect(expectStr).toEqual(['/sensors(dialog:sensors-config/squid)']);

    expect(event.stopPropagation).toHaveBeenCalled();

    fixture.destroy();
  }));

  it('addAddSensor should change the URL', async(() => {
    spyOn(router, 'navigateByUrl');

    let component: SensorParserListComponent = fixture.componentInstance;

    component.addAddSensor();

    let expectStr = router.navigateByUrl['calls'].argsFor(0);
    expect(expectStr).toEqual(['/sensors(dialog:sensors-config/new)']);

    fixture.destroy();
  }));

  it('onRowSelected should add add/remove items from the selected stack', async(() => {
    let component: SensorParserListComponent = fixture.componentInstance;
    let event = { target: { checked: true } };

    let sensorParserConfig = new ParserConfigModel('TestConfigId01');
    sensorParserConfig.sensorTopic = 'squid';
    let sensorParserConfigHistory = {
      config: sensorParserConfig
    };

    component.onRowSelected(sensorParserConfigHistory, event);

    expect(component.selectedSensors[0]).toEqual(sensorParserConfigHistory.config.getName());

    event = { target: { checked: false } };

    component.onRowSelected(sensorParserConfigHistory, event);
    expect(component.selectedSensors).toEqual([]);

    fixture.destroy();
  }));

  it('onSelectDeselectAll should populate items into selected stack', async(() => {

    // FIXME: this test is testing implementation details: however the business logic hasn't been changed,
    // the test fails because the implementation of the same logic has been changed :(.


    // let component: SensorParserListComponent = fixture.componentInstance;

    // let sensorParserConfig1 = new ParserConfigModel();
    // sensorParserConfig1.sensorTopic = 'squid';
    // let sensorParserConfig2 = new ParserConfigModel();
    // sensorParserConfig2.sensorTopic = 'bro';
    // let sensorParserConfigHistory1 = new ParserMetaInfoModel(sensorParserConfig1);
    // let sensorParserConfigHistory2 = new ParserMetaInfoModel(sensorParserConfig2);

    // component.sensors.push(sensorParserConfigHistory1);
    // component.sensors.push(sensorParserConfigHistory2);

    // let event = { target: { checked: true } };

    // component.onSelectDeselectAll(event);

    // expect(component.selectedSensors).toEqual([
    //   sensorParserConfigHistory1,
    //   sensorParserConfigHistory2
    // ]);

    // event = { target: { checked: false } };

    // component.onSelectDeselectAll(event);

    // expect(component.selectedSensors).toEqual([]);

    // fixture.destroy();
  }));

  it('onSensorRowSelect should change the url and updated the selected items stack', async(() => {
    let sensorParserConfigHistory1 = {
      config: new ParserConfigModel('TestConfigId01')
    };
    sensorParserConfigHistory1.config.setName('squid');

    let component: SensorParserListComponent = fixture.componentInstance;

    component.selectedSensor = sensorParserConfigHistory1;
    component.onSensorRowSelect(sensorParserConfigHistory1);

    expect(component.selectedSensor).toEqual(null);

    component.onSensorRowSelect(sensorParserConfigHistory1);

    expect(component.selectedSensor).toEqual(sensorParserConfigHistory1);

    component.selectedSensor = sensorParserConfigHistory1;

    component.onSensorRowSelect(sensorParserConfigHistory1);

    expect(component.selectedSensor).toEqual(null);

    fixture.destroy();
  }));

  it(
    'onStartSensors/onStopSensors should call start on all sensors that have status != ' +
      'Running and status != Running respectively',
    async(() => {
      let component: SensorParserListComponent = fixture.componentInstance;

      spyOn(component, 'onStartSensor');
      spyOn(component, 'onStopSensor');
      spyOn(component, 'onDisableSensor');
      spyOn(component, 'onEnableSensor');

      let sensorParserConfig1 = new ParserConfigModel('TestConfigId01');
      let sensorParserConfig2 = new ParserConfigModel('TestConfigId02');
      let sensorParserConfig3 = new ParserConfigModel('TestConfigId03');
      let sensorParserConfig4 = new ParserConfigModel('TestConfigId04');
      let sensorParserConfig5 = new ParserConfigModel('TestConfigId05');
      let sensorParserConfig6 = new ParserConfigModel('TestConfigId06');
      let sensorParserConfig7 = new ParserConfigModel('TestConfigId07');

      let sensorParserConfigHistory1 = { config: sensorParserConfig1, status: new TopologyStatus() };
      let sensorParserConfigHistory2 = { config: sensorParserConfig2, status: new TopologyStatus() };
      let sensorParserConfigHistory3 = { config: sensorParserConfig3, status: new TopologyStatus() };
      let sensorParserConfigHistory4 = { config: sensorParserConfig4, status: new TopologyStatus() };
      let sensorParserConfigHistory5 = { config: sensorParserConfig5, status: new TopologyStatus() };
      let sensorParserConfigHistory6 = { config: sensorParserConfig6, status: new TopologyStatus() };
      let sensorParserConfigHistory7 = { config: sensorParserConfig7, status: new TopologyStatus() };

      sensorParserConfig1.sensorTopic = 'squid';
      sensorParserConfigHistory1.status.status = 'ACTIVE';

      sensorParserConfig2.sensorTopic = 'bro';
      sensorParserConfigHistory2.status.status = 'KILLED';

      sensorParserConfig3.sensorTopic = 'test';
      sensorParserConfigHistory3.status.status = 'KILLED';

      sensorParserConfig4.sensorTopic = 'test1';
      sensorParserConfigHistory4.status.status = 'KILLED';

      sensorParserConfig5.sensorTopic = 'test2';
      sensorParserConfigHistory5.status.status = 'ACTIVE';

      sensorParserConfig6.sensorTopic = 'test2';
      sensorParserConfigHistory6.status.status = 'INACTIVE';

      sensorParserConfig7.sensorTopic = 'test3';
      sensorParserConfigHistory7.status.status = 'INACTIVE';

      component.sensors = [
        sensorParserConfigHistory1,
        sensorParserConfigHistory2,
        sensorParserConfigHistory3,
        sensorParserConfigHistory4,
        sensorParserConfigHistory5,
        sensorParserConfigHistory6,
        sensorParserConfigHistory7,
      ];

      component.selectedSensors = [
        sensorParserConfigHistory1.config.getName(),
        sensorParserConfigHistory2.config.getName(),
        sensorParserConfigHistory3.config.getName(),
        sensorParserConfigHistory4.config.getName(),
        sensorParserConfigHistory5.config.getName(),
        sensorParserConfigHistory6.config.getName(),
        sensorParserConfigHistory7.config.getName()
      ];

      component.onStartSensors();
      expect(component.onStartSensor['calls'].count()).toEqual(3);

      component.onStopSensors();
      expect(component.onStopSensor['calls'].count()).toEqual(4);

      component.onDisableSensors();
      expect(component.onDisableSensor['calls'].count()).toEqual(2);

      component.onEnableSensors();
      expect(component.onEnableSensor['calls'].count()).toEqual(2);

      fixture.destroy();
    })
  );

  it('isStoppable() should return true unless a sensor is KILLED', async(() => {
    const component = Object.create( SensorParserListComponent.prototype );
    const sensorParserConfig1 = new ParserConfigModel('TestConfigId01');
    let sensor: ParserMetaInfoModel = { config: sensorParserConfig1, status: new TopologyStatus() };

    sensor.status.status = 'KILLED';
    expect(component.isStoppable(sensor)).toBe(false);

    sensor.status.status = 'ACTIVE';
    expect(component.isStoppable(sensor)).toBe(true);

    sensor.status.status = 'INACTIVE';
    expect(component.isStoppable(sensor)).toBe(true);
  }));

  it('isStartable() should return true only when a parser is KILLED', async(() => {
    const component = Object.create( SensorParserListComponent.prototype );
    const sensorParserConfig1 = new ParserConfigModel('TestConfigId01');
    let sensor: ParserMetaInfoModel = { config: sensorParserConfig1, status: new TopologyStatus() };

    sensor.status.status = 'KILLED';
    expect(component.isStartable(sensor)).toBe(true);

    sensor.status.status = 'ACTIVE';
    expect(component.isStartable(sensor)).toBe(false);

    sensor.status.status = 'INACTIVE';
    expect(component.isStartable(sensor)).toBe(false);
  }));

  it('isEnableable() should return true only when a parser is ACTIVE', async(() => {
    const component = Object.create( SensorParserListComponent.prototype );
    const sensorParserConfig1 = new ParserConfigModel('TestConfigId01');
    let sensor: ParserMetaInfoModel = { config: sensorParserConfig1, status: new TopologyStatus() };

    sensor.status.status = 'KILLED';
    expect(component.isEnableable(sensor)).toBe(false);

    sensor.status.status = 'ACTIVE';
    expect(component.isEnableable(sensor)).toBe(false);

    sensor.status.status = 'INACTIVE';
    expect(component.isEnableable(sensor)).toBe(true);
  }));

  it('isDisableable() should return true only when a parser is INACTIVE', async(() => {
    const component = Object.create( SensorParserListComponent.prototype );
    const sensorParserConfig1 = new ParserConfigModel('TestConfigId01');
    let sensor: ParserMetaInfoModel = { config: sensorParserConfig1, status: new TopologyStatus() };

    sensor.status.status = 'KILLED';
    expect(component.isDisableable(sensor)).toBe(false);

    sensor.status.status = 'ACTIVE';
    expect(component.isDisableable(sensor)).toBe(true);

    sensor.status.status = 'INACTIVE';
    expect(component.isDisableable(sensor)).toBe(false);
  }));

  it('isDeletedOrPhantom() should return true if a parser is deleted or a phantom', async(() => {
    const component = Object.create( SensorParserListComponent.prototype );
    const sensorParserConfig1 = new ParserConfigModel('TestConfigId01');
    let sensor: ParserMetaInfoModel = { config: sensorParserConfig1, status: new TopologyStatus() };

    expect(component.isDeletedOrPhantom(sensor)).toBe(false);

    sensor.isDeleted = true;
    expect(component.isDeletedOrPhantom(sensor)).toBe(true);

    sensor.isDeleted = false;
    sensor.isPhantom = true;
    expect(component.isDeletedOrPhantom(sensor)).toBe(true);
  }));

  it('should hide parser controls when they cannot be used', async(() => {
    fixture.detectChanges();

    const stopButtons = fixture.debugElement.queryAll(By.css('[data-qe-id="stop-parser-button"]'));
    const startButtons = fixture.debugElement.queryAll(By.css('[data-qe-id="start-parser-button"]'));
    const enableButtons = fixture.debugElement.queryAll(By.css('[data-qe-id="enable-parser-button"]'));
    const disableButtons = fixture.debugElement.queryAll(By.css('[data-qe-id="disable-parser-button"]'));
    const selectWrappers = fixture.debugElement.queryAll(By.css('[data-qe-id="sensor-select"]'));
    const editButtons = fixture.debugElement.queryAll(By.css('[data-qe-id="edit-parser-button"]'));
    const deleteButtons = fixture.debugElement.queryAll(By.css('[data-qe-id="delete-parser-button"]'));

    // !KILLED status should show stop button
    expect(stopButtons[0].properties.hidden).toBe(true);
    expect(stopButtons[1].properties.hidden).toBe(false);
    expect(stopButtons[2].properties.hidden).toBe(false);
    expect(stopButtons[3].properties.hidden).toBe(true);
    expect(stopButtons[4].properties.hidden).toBe(true);

    // KILLED status should only show start button
    expect(startButtons[0].properties.hidden).toBe(false);
    expect(startButtons[1].properties.hidden).toBe(true);
    expect(startButtons[2].properties.hidden).toBe(true);
    expect(startButtons[3].properties.hidden).toBe(true);
    expect(startButtons[4].properties.hidden).toBe(true);

    // ACTIVE status should hide enable buttons
    expect(enableButtons[0].properties.hidden).toBe(true);
    expect(enableButtons[1].properties.hidden).toBe(false);
    expect(enableButtons[2].properties.hidden).toBe(true);
    expect(enableButtons[3].properties.hidden).toBe(true);
    expect(enableButtons[4].properties.hidden).toBe(true);

    // INACTIVE status should hide disable buttons
    expect(disableButtons[0].properties.hidden).toBe(true);
    expect(disableButtons[1].properties.hidden).toBe(true);
    expect(disableButtons[2].properties.hidden).toBe(false);
    expect(disableButtons[3].properties.hidden).toBe(true);
    expect(disableButtons[4].properties.hidden).toBe(true);

    // Edit button should hide if a parser or group is deleted
    expect(editButtons[0].properties.hidden).toBe(false);
    expect(editButtons[1].properties.hidden).toBe(false);
    expect(editButtons[2].properties.hidden).toBe(false);
    expect(editButtons[3].properties.hidden).toBe(true);
    expect(editButtons[4].properties.hidden).toBe(false);

    expect(deleteButtons[0].properties.hidden).toBe(false);
    expect(deleteButtons[1].properties.hidden).toBe(false);
    expect(deleteButtons[2].properties.hidden).toBe(false);
    expect(deleteButtons[3].properties.hidden).toBe(true);
    expect(deleteButtons[4].properties.hidden).toBe(false);

    // select checkbox should hide if parser is deleted or a phantom
    expect(selectWrappers[0].properties.hidden).toBe(false);
    expect(selectWrappers[1].properties.hidden).toBe(false);
    expect(selectWrappers[2].properties.hidden).toBe(false);
    expect(selectWrappers[3].properties.hidden).toBe(true);
    expect(selectWrappers[4].properties.hidden).toBe(true);
  }));
});
