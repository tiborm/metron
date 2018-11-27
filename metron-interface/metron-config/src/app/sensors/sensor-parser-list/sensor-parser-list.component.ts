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
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { ParserConfigModel } from '../models/parser-config.model';
import { MetronAlerts } from '../../shared/metron-alerts';
import { MetronDialogBox } from '../../shared/metron-dialog-box';
import { StormService } from '../../service/storm.service';
import { TopologyStatus } from '../../model/topology-status';
import { Observable, Subscription } from 'rxjs';
import { ParserMetaInfoModel } from '../models/parser-meta-info.model';
import { Store, select } from '@ngrx/store';
import * as fromActions from '../actions';
import * as fromReducers from '../reducers';

@Component({
  selector: 'metron-config-sensor-parser-list',
  templateUrl: 'sensor-parser-list.component.html',
  styleUrls: ['sensor-parser-list.component.scss']
})
export class SensorParserListComponent implements OnInit, OnDestroy {

  componentName = 'Sensors';
  @ViewChild('table') table;

  sensorsStatus: TopologyStatus[] = [];
  selectedSensor: ParserMetaInfoModel;
  selectedSensors: ParserMetaInfoModel[] = [];
  enableAutoRefresh = true;
  isDirty$: Observable<boolean>;
  mergedConfigs$: Observable<ParserMetaInfoModel[]>;
  sensors: ParserMetaInfoModel[] = [];

  private mergedConfigSub: Subscription;
  private isStatusPolling: boolean;
  private draggedElement: ParserMetaInfoModel;

  constructor(private stormService: StormService,
              private router: Router,
              private metronAlerts:  MetronAlerts,
              private metronDialogBox: MetronDialogBox,
              private store: Store<fromReducers.State>) {
    router.events.subscribe(event => {
      if (event instanceof NavigationStart && event.url === '/sensors') {
        this.onNavigationStart();
      }
    });

    this.mergedConfigs$ = store.pipe(select(fromReducers.getMergedConfigs));
    this.isDirty$ = store.pipe(select(fromReducers.isDirty));
  }

  getParserType(sensor: ParserConfigModel): string {
    if (!sensor.parserClassName) {
      return '';
    }
    let items = sensor.parserClassName.split('.');
    return items[items.length - 1].replace('Basic', '').replace('Parser', '');
  }

  ngOnInit() {
    this.store.dispatch(new fromActions.LoadStart());

    this.mergedConfigSub = this.mergedConfigs$.subscribe((sensors: ParserMetaInfoModel[]) => {
      this.sensors = sensors;
    });

    if (!this.isStatusPolling) {
      this.isStatusPolling = true;
      this.store.dispatch(new fromActions.StartPolling());
    }
  }

  addAddSensor() {
    this.router.navigateByUrl('/sensors(dialog:sensors-config/new)');
  }

  navigateToSensorEdit(selectedSensor: ParserMetaInfoModel, event) {
    this.selectedSensor = selectedSensor;
    this.router.navigateByUrl('/sensors(dialog:sensors-config/' + selectedSensor.getName() + ')');
    event.stopPropagation();
  }

  onRowSelected(parserConfig: ParserMetaInfoModel, $event) {
    if ($event.target.checked) {
      this.selectedSensors.push(parserConfig);
    } else {
      this.selectedSensors.splice(this.selectedSensors.indexOf(parserConfig), 1);
    }
  }

  onSelectDeselectAll(sensors, $event) {
    let checkBoxes = this.table.nativeElement.querySelectorAll('tr td:last-child input[type="checkbox"]');

    for (let ele of checkBoxes) {
      ele.checked = $event.target.checked;
    }

    if ($event.target.checked) {
      this.selectedSensors = sensors.slice();
    } else {
      this.selectedSensors = [];
    }
  }

  onSensorRowSelect(sensor: ParserMetaInfoModel) {
    if (this.selectedSensor === sensor) {
      this.selectedSensor = null;
      this.router.navigateByUrl('/sensors');
      return;
    }
    this.selectedSensor = sensor;
    this.router.navigateByUrl('/sensors(dialog:sensors-readonly/' + sensor.getName() + ')');
  }

  showConfirm(message: string, callback: Function) {
    this.metronDialogBox.showConfirmationMessage(message).subscribe(callback);
  }

  onDeleteSelectedItems() {
    const names = this.selectedSensors.map(p => p.getName());
    this.showConfirm('Are you sure you want to delete ' + names.join(', ') + ' ?', (confirmed: boolean) => {
      if (confirmed) {
        this.store.dispatch(new fromActions.MarkAsDeleted({
          parserIds: names
        }));
      }
    });
  }

  onDeleteItem(item: ParserMetaInfoModel, e: Event) {
    this.showConfirm('Are you sure you want to delete ' + item.getName() + ' ?', (confirmed: boolean) => {
      if (confirmed) {
        this.store.dispatch(new fromActions.MarkAsDeleted({
          parserIds: [item.getName()]
        }));
      }
    });
    e.stopPropagation();
  }

  onStopSensors() {
    for (let sensor of this.selectedSensors) {
      if (sensor.getStatus().status === 'ACTIVE' || sensor.getStatus().status === 'INACTIVE') {
        this.onStopSensor(sensor, null);
      }
    }
  }

  onStopSensor(sensor: ParserMetaInfoModel, event) {
    this.toggleStartStopInProgress(sensor);

    this.stormService.stopParser(sensor.getName()).subscribe(() => {
        this.metronAlerts.showSuccessMessage('Stopped sensor ' + sensor.getName());
        this.toggleStartStopInProgress(sensor);
      },
      () => {
        this.metronAlerts.showErrorMessage('Unable to stop sensor ' + sensor.getName());
        this.toggleStartStopInProgress(sensor);
      });

    if (event !== null) {
      event.stopPropagation();
    }
  }

  onStartSensors() {
    for (let sensor of this.selectedSensors) {
      if (sensor.getStatus().status === 'KILLED') {
        this.onStartSensor(sensor, null);
      }
    }
  }

  onStartSensor(sensor: ParserMetaInfoModel, event) {
    this.toggleStartStopInProgress(sensor);

    this.stormService.startParser(sensor.getName()).subscribe(result => {
        if (result['status'] === 'ERROR') {
          this.metronAlerts.showErrorMessage('Unable to start sensor ' + sensor.getName() + ': ' + result['message']);
        } else {
          this.metronAlerts.showSuccessMessage('Started sensor ' + sensor.getName());
        }

        this.toggleStartStopInProgress(sensor);
      },
      () => {
        this.metronAlerts.showErrorMessage('Unable to start sensor ' + sensor.getName());
        this.toggleStartStopInProgress(sensor);
      });

    if (event !== null) {
      event.stopPropagation();
    }
  }

  onDisableSensors() {
    for (let sensor of this.selectedSensors) {
      if (sensor.getStatus().status === 'ACTIVE') {
        this.onDisableSensor(sensor, null);
      }
    }
  }

  onDisableSensor(sensor: ParserMetaInfoModel, event) {
    this.toggleStartStopInProgress(sensor);

    this.stormService.deactivateParser(sensor.getName()).subscribe(() => {
        this.metronAlerts.showSuccessMessage('Disabled sensor ' + sensor.getName());
        this.toggleStartStopInProgress(sensor);
      },
      () => {
        this.metronAlerts.showErrorMessage('Unable to disable sensor ' + sensor.getName());
        this.toggleStartStopInProgress(sensor);
      });

    if (event !== null) {
      event.stopPropagation();
    }
  }

  onEnableSensors() {
    for (let sensor of this.selectedSensors) {
      if (sensor.getStatus().status === 'INACTIVE') {
        this.onEnableSensor(sensor, null);
      }
    }
  }

  onEnableSensor(sensor: ParserMetaInfoModel, event) {
    this.toggleStartStopInProgress(sensor);

    this.stormService.activateParser(sensor.getName()).subscribe(() => {
        this.metronAlerts.showSuccessMessage('Enabled sensor ' + sensor.getName());
        this.toggleStartStopInProgress(sensor);
      },
      () => {
        this.metronAlerts.showErrorMessage('Unable to enabled sensor ' + sensor.getName());
        this.toggleStartStopInProgress(sensor);
      });

    if (event != null) {
      event.stopPropagation();
    }
  }

  toggleStartStopInProgress(sensor: ParserMetaInfoModel) {
    sensor.startStopInProgress = !sensor.startStopInProgress;
  }

  onNavigationStart() {
    this.selectedSensor = null;
    this.selectedSensors = [];
  }

  onDragStart(metaInfo: ParserMetaInfoModel, e: DragEvent) {
    this.draggedElement = metaInfo;
    e.dataTransfer.setDragImage((e.target as HTMLElement).parentElement, 10, 17);
    this.store.dispatch(new fromActions.SetDragged(metaInfo.getName()));
  }

  onDragOver(sensor, e: DragEvent) {
    const el = (e.currentTarget as HTMLElement);
    const rect = el.getBoundingClientRect();
    const mouseX = e.pageX;
    const mouseY = e.pageY;

    if (mouseX > rect.left + 8 && mouseY > rect.top + 8 && mouseX <= (rect.right - 8) && mouseY <= (rect.bottom - 8)) {
      this.store.dispatch(new fromActions.SetDraggedOver({
        id: sensor.getName(),
        value: true,
      }));
    } else {
      this.store.dispatch(new fromActions.SetDraggedOver({
        id: sensor.getName(),
        value: false,
      }));
    }

    if (mouseY > rect.top && mouseY < (rect.top + 8)) {
      el.classList.add('drop-before');
    } else {
      el.classList.remove('drop-before');
    }
    if (mouseY > rect.top && mouseY > (rect.bottom - 8) && mouseY <= rect.bottom) {
      el.classList.add('drop-after');
    } else {
      el.classList.remove('drop-after');
    }

    e.preventDefault();
  }

  onDragEnter(sensor) {
    const groupName = sensor.getGroup();
    if (!groupName) {
      return;
    }
    setTimeout(() => {
      this.store.dispatch(new fromActions.SetHighlighted({
        id: groupName,
        value: true,
      }));
    });
  }

  onDragLeave(sensor, e: DragEvent) {
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const mouseX = e.pageX;
    const mouseY = e.pageY;

    if (mouseX < rect.left || mouseY < rect.top || mouseX >= rect.right || mouseY >= rect.bottom) {
      el.classList.remove('drop-before');
      el.classList.remove('drop-after');
      this.store.dispatch(new fromActions.SetDraggedOver({
        id: sensor.getName(),
        value: false,
      }));

      const groupName = sensor.getGroup();
      if (!groupName) {
        return;
      }
      this.store.dispatch(new fromActions.SetHighlighted({
        id: groupName,
        value: false,
      }));
    }
  }

  onDrop(referenceMetaInfo: ParserMetaInfoModel, e: DragEvent) {
    this.store.dispatch(new fromActions.SetAllHighlighted(false));
    this.store.dispatch(new fromActions.SetAllDraggedOver(false));
    const el = e.currentTarget as HTMLElement;
    const dragged = this.draggedElement;
    if (dragged.getName() !== referenceMetaInfo.getName() && !referenceMetaInfo.isDeleted) {
      if (el.classList.contains('drop-before') || el.classList.contains('drop-after')) {
        if (referenceMetaInfo.getGroup() !== dragged.getGroup() || referenceMetaInfo.isGroup()) {
          this.store.dispatch(new fromActions.AddToGroup({
            groupName: referenceMetaInfo.hasGroup()
              ? referenceMetaInfo.getGroup()
              : referenceMetaInfo.isGroup()
                ? referenceMetaInfo.getName()
                : '',
            parserIds: [dragged.getName()]
          }));
        }
      }
      if (el.classList.contains('drop-before')) {
        this.store.dispatch(new fromActions.InjectBefore({
          reference: referenceMetaInfo.getName(),
          parserId: dragged.getName(),
        }));
      } else if (el.classList.contains('drop-after')) {
        this.store.dispatch(new fromActions.InjectAfter({
          reference: referenceMetaInfo.getName(),
          parserId: dragged.getName(),
        }));
      } else {
        if (referenceMetaInfo.isGroup() && !referenceMetaInfo.isDeleted) {
          this.store.dispatch(new fromActions.AddToGroup({
            groupName: referenceMetaInfo.getName(),
            parserIds: [dragged.getName()]
          }));
          this.store.dispatch(new fromActions.InjectAfter({
            reference: referenceMetaInfo.getName(),
            parserId: dragged.getName(),
          }));
        } else {
          this.store.dispatch(new fromActions.SetDropTarget(referenceMetaInfo.getName()));
          this.store.dispatch(new fromActions.SetTargetGroup(referenceMetaInfo.getConfig().group || ''));
          this.router.navigateByUrl('/sensors(dialog:sensor-aggregate)');
        }
      }
    }
    el.classList.remove('drop-before');
    el.classList.remove('drop-after');
  }

  onApply() {
    this.store.dispatch(new fromActions.ApplyChanges());
  }

  onDiscard() {
    this.store.dispatch(new fromActions.LoadStart());
  }

  ngOnDestroy() {
    if (this.mergedConfigSub) {
      this.mergedConfigSub.unsubscribe();
    }
  }

  isSelected(sensor) {
    return this.selectedSensors.find(s => {
      if (s.getName() === sensor.getName()) {
        return true;
      } else {
        return false;
      }
    })
  }
}
