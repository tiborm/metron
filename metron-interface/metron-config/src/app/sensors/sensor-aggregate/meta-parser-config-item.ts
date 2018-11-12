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
import { SensorParserConfigHistory } from '../../model/sensor-parser-config-history';
import { Subject, Observable } from 'rxjs';
import { SensorParserConfigService } from 'app/service/sensor-parser-config.service';

const DEFAULT_UNDO_TIMEOUT = 60000;

export class MetaParserConfigItem {

  readonly CHANGE_APPLY_DELAY = 3000;

  private parserConfigService: SensorParserConfigService;

  _sensor: SensorParserConfigHistory = null;

  _cache: any = null;
  _previousIndex = -1;

  _isParent: boolean;
  _timer = -1;

  changed$ = new Subject();

  _highlighted = false;
  _draggedOver = false;

  constructor(sensor: SensorParserConfigHistory,
    parserConfigService: SensorParserConfigService) {
    this._sensor = sensor;
    this.parserConfigService = parserConfigService;
  }

  getSensor(): SensorParserConfigHistory {
    return this._sensor;
  }

  setProps(props) {

    if (typeof props.groupName !== 'undefined') {
      this._sensor.config.group = props.groupName;
    }
  }

  hasGroup(): boolean {
    return !!this._sensor.config.group;
  }

  getGroup(): string {
    return this._sensor.config.group;
  }

  getName(): string {
    return this._sensor.sensorName;
  }

  setName(name: string) {
    this._sensor.sensorName = name;
  }

  setIsParent(value: boolean) {
    this._isParent = value;
  }

  isParent() {
    return this._isParent;
  }

  setStatus(status: string) {
    this._sensor.status = status;
  }

  setHighlighted(value: boolean) {
    this._highlighted = value;
  }

  getHighlighted(): boolean {
    return this._highlighted;
  }

  setDraggedOver(value: boolean) {
    this._draggedOver = value;
  }

  getDraggedOver(): boolean {
    return this._draggedOver;
  }

  _startTimer(fn, delay = DEFAULT_UNDO_TIMEOUT) {
    this._timer = setTimeout(fn, delay);
  }

  startTimer() {
    if (this._timer) {
      this._stopTimer();
    }
    this._startTimer(this.onTimerTick.bind(this), this.CHANGE_APPLY_DELAY);
  }

  _stopTimer() {
    clearTimeout(this._timer);
    this._timer = -1;
  }

  private onTimerTick() {
    this._stopTimer();
    this.parserConfigService
      .saveConfig(this._sensor.sensorName, this._sensor.config)
      .subscribe(this._next.bind(this));
  }

  canUndo() {
    return this._timer > -1;
  }

  isChanged(): Observable<any> {
    return this.changed$.asObservable();
  }

  _next() {
    this.changed$.next();
  }

  destroy() {
    if (this._timer) {
      this._stopTimer();
    }
    this._sensor = null;
  }

  restorePreviousState() {
    this._sensor = this._cache;
    this._cache = null;
    this._stopTimer();
  }

  storePreviousState() {
    this._cache = this._sensor.clone();
  }

  getPreviousState() {
    return this._cache;
  }
}