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
import { Effect, Actions, ofType } from '@ngrx/effects'
import { Observable, forkJoin, of } from 'rxjs';
import { Action, Store, select } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { mergeMap, map, switchMap, withLatestFrom, catchError } from 'rxjs/operators';
import { SensorParserConfigService } from 'app/service/sensor-parser-config.service';
import { ParserConfigModel } from '../models/parser-config.model';
import * as fromActions from '../actions';
import { StormService } from '../../service/storm.service';
import { TopologyStatus } from '../../model/topology-status';
import { ParserMetaInfoModel } from '../models/parser-meta-info.model';
import { ParserGroupModel } from '../models/parser-group.model';
import * as fromReducers from '../reducers';
import { MetronAlerts } from '../../shared/metron-alerts';
import { TopologyResponse } from '../../model/topology-response';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class SensorsEffects {

  @Effect()
  loadData$: Observable<Action> = this.actions$.pipe(
    ofType(fromActions.SensorsActionTypes.LoadStart),
    mergeMap(() => {
      return forkJoin(
        this.parserService.getAllConfig(),
        this.parserService.getAllGroups(),
        this.stormService.getAll(),
      ).pipe(
          map(([ configs, groups, statuses ]) => {
          const configsArray: ParserMetaInfoModel[] = Object.keys(configs).map((configId) => {
            const metaInfo: ParserMetaInfoModel = {
              config: new ParserConfigModel(configId, configs[configId])
            };
            return metaInfo;
          });
          const groupsArray: ParserMetaInfoModel[] =  Array.isArray(groups) ? groups.map((group) => {
            const metaInfo: ParserMetaInfoModel = {
              config: new ParserGroupModel(group),
              isGroup: true
            };
            const sensors = (metaInfo.config as ParserGroupModel).getSensors();
            if (sensors && sensors.length > 0) {
              sensors.map((sensor: string) => {
                const configMeta = configsArray.find(c => c.config.getName() === sensor);
                if (configMeta) {
                  configMeta.config.group = metaInfo.config.getName();
                }
              });
            }
            return metaInfo;
          }) : [];
          return new fromActions.LoadSuccess({
            parsers: configsArray,
            groups: groupsArray,
            statuses: statuses,
          } as fromActions.LoadSuccesActionPayload);
        })
      )
    })
  );

  @Effect()
  startPolling$: Observable<Action> = this.actions$.pipe(
    ofType(fromActions.SensorsActionTypes.StartPolling),
    switchMap(() => {
      return this.stormService.pollGetAll()
        .pipe(
          map((statuses: TopologyStatus[]) => {
            return new fromActions.PollStatusSuccess({statuses})
          })
        )
    })
  );

  @Effect()
  applyChanges$: Observable<Action> = this.actions$.pipe(
    ofType(fromActions.SensorsActionTypes.ApplyChanges),
    withLatestFrom(this.store.pipe(select(fromReducers.getSensorsState))),
    mergeMap(([ , state ]) => {
      return forkJoin(
        this.parserService.syncConfigs(state.parsers.items),
        this.parserService.syncGroups(state.groups.items),
      ).pipe(
        catchError((error) => {
          const message = error.error ? error.error.message : error.message;
          this.alertSvc.showErrorMessage(message);
          return error;
        }),
        map(() => {
          this.alertSvc.showSuccessMessage('Your changes has been applied successfully');
          return new fromActions.LoadStart();
      }));
    })
  )

  @Effect()
  startSensor$: Observable<Action> = this.actions$.pipe(
    ofType(fromActions.SensorsActionTypes.StartSensor),
    mergeMap(this.getControlMapHandlerFor('start'))
  )

  @Effect()
  stopSensor$: Observable<Action> = this.actions$.pipe(
    ofType(fromActions.SensorsActionTypes.StopSensor),
    mergeMap(this.getControlMapHandlerFor('stop'))
  )

  @Effect()
  enableSensor$: Observable<Action> = this.actions$.pipe(
    ofType(fromActions.SensorsActionTypes.EnableSensor),
    mergeMap(this.getControlMapHandlerFor('enable'))
  )

  @Effect()
  disableSensor$: Observable<Action> = this.actions$.pipe(
    ofType(fromActions.SensorsActionTypes.DisableSensor),
    mergeMap(this.getControlMapHandlerFor('disable'))
  )

  constructor(
    private parserService: SensorParserConfigService,
    private stormService: StormService,
    private actions$: Actions,
    private store: Store<fromReducers.State>,
    private alertSvc: MetronAlerts
  ) {}

  /**
   * For each sensor control opearation the map (like switchMap or mergeMap) handler does almost the same with
   * a few differences. This helper method is for dealing with the differences and includes the
   * majority of the functionality (DRY).
   */
  private getControlMapHandlerFor(type: 'start' | 'stop' | 'enable' | 'disable') {
    let serviceMethod;
    let actionMessage;
    let statusString;
    let SuccessAction;
    let FailureAction;
    switch (type) {
      case 'start': {
        serviceMethod = 'startParser';
        actionMessage = 'start';
        statusString = 'Started';
        SuccessAction = fromActions.StartSensorSuccess;
        FailureAction = fromActions.StartSensorFailure;
        break;
      }
      case 'stop': {
        serviceMethod = 'stopParser';
        actionMessage = 'stop';
        statusString = 'Stopped';
        SuccessAction = fromActions.StopSensorSuccess;
        FailureAction = fromActions.StopSensorFailure;
        break;
      }
      case 'enable': {
        serviceMethod = 'activateParser';
        actionMessage = 'enable';
        statusString = 'Enabled';
        SuccessAction = fromActions.EnableSensorSuccess;
        FailureAction = fromActions.EnableSensorFailure;
        break;
      }
      case 'disable': {
        serviceMethod = 'deactivateParser';
        actionMessage = 'disable';
        statusString = 'Disabled';
        SuccessAction = fromActions.DisableSensorSuccess;
        FailureAction = fromActions.DisableSensorFailure;
        break;
      }
    }
    return (action: fromActions.SensorControlAction) => {
      return this.stormService[serviceMethod](action.payload.parser.config.getName())
        .pipe(
          catchError((error) => of(error)),
          map((result: TopologyResponse | HttpErrorResponse) => {
            if (result instanceof HttpErrorResponse || result.status === 'ERROR') {
              this.alertSvc.showErrorMessage(
                'Unable to ' + actionMessage + ' sensor ' + action.payload.parser.config.getName() + ': ' + result.message
              );
              return new FailureAction({
                status: 'ERROR',
                parser: action.payload.parser,
              });
            }
            this.alertSvc.showSuccessMessage(statusString + ' sensor ' + action.payload.parser.config.getName());
            return new SuccessAction({
              status: 'SUCCESS',
              parser: action.payload.parser,
            });
          })
        )
      };
  }

}
