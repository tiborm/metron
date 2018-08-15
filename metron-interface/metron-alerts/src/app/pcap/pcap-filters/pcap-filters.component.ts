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
import {Component, Input, Output, EventEmitter, OnChanges, SimpleChanges} from '@angular/core';
import { FormGroup, FormControl, Validators, ValidationErrors } from '@angular/forms';

import * as moment from 'moment/moment';
import { DEFAULT_TIMESTAMP_FORMAT } from '../../utils/constants';

import { PcapRequest } from '../model/pcap.request';

const DEFAULT_END_TIME = new Date();
const DEFAULT_START_TIME = new Date().setDate(DEFAULT_END_TIME.getDate() - 5);

function dateRangeValidator(formControl: FormControl): ValidationErrors | null {
  if (!formControl.parent) {
    return null;
  }

  const filterForm = formControl.parent;
  const startTimeMs = new Date(filterForm.controls['startTime'].value).getTime();
  const endTimeMs = new Date(filterForm.controls['endTime'].value).getTime();

  if (startTimeMs > endTimeMs || endTimeMs > new Date().getTime()) {
    return { error: 'Selected date range is invalid.' };
  }
  return null;
}

export type PcapFilterFormValue = {
  startTime: string,
  endTime: string,
  ipSrcAddr: string,
  ipDstAddr: string,
  ipSrcPort: string,
  ipDstPort: string,
  protocol: string,
  includeReverse: boolean,
  packetFilter: string
};

function transformModelToControlValue(model: PcapRequest): PcapFilterFormValue {
  const startTimeStr = moment(Math.max(model.startTimeMs, DEFAULT_START_TIME)).format(DEFAULT_TIMESTAMP_FORMAT);
  let endTimeStr = moment(model.endTimeMs).format(DEFAULT_TIMESTAMP_FORMAT);
  if (isNaN((new Date(model.endTimeMs).getTime()))) {
    // if it's an Invalid Date.
    endTimeStr = moment(DEFAULT_END_TIME).format(DEFAULT_TIMESTAMP_FORMAT);
  } else {
    endTimeStr = moment(model.endTimeMs).format(DEFAULT_TIMESTAMP_FORMAT);
  }

  return {
    startTime: startTimeStr,
    endTime: endTimeStr,
    ipSrcAddr: model.ipSrcAddr,
    ipDstAddr: model.ipDstAddr,
    ipSrcPort: model.ipSrcPort ? String(model.ipSrcPort) : '',
    ipDstPort: model.ipDstPort ? String(model.ipDstPort) : '',
    protocol: model.protocol,
    includeReverse: model.includeReverse,
    packetFilter: model.packetFilter
  };
}

function transformControlValueToModel(control: FormGroup): PcapRequest {
  const pcapRequest = new PcapRequest();
  pcapRequest.startTimeMs = new Date(control.value.startTime).getTime();
  pcapRequest.endTimeMs = new Date(control.value.endTime).getTime();
  pcapRequest.ipSrcAddr = control.value.ipSrcAddr;
  pcapRequest.ipDstAddr = control.value.ipDstAddr;
  pcapRequest.ipSrcPort = +control.value.ipSrcPort || 0;
  pcapRequest.ipDstPort = +control.value.ipDstPort || 0;
  pcapRequest.protocol =  control.value.protocol;
  pcapRequest.includeReverse = control.value.includeReverse;
  pcapRequest.packetFilter = control.value.packetFilter;
  return pcapRequest;
}

@Component({
  selector: 'app-pcap-filters',
  templateUrl: './pcap-filters.component.html',
  styleUrls: ['./pcap-filters.component.scss']
})
export class PcapFiltersComponent implements OnChanges {

  @Input() queryRunning = true;
  @Input() model: PcapRequest = new PcapRequest();
  @Output() search: EventEmitter<PcapRequest> = new EventEmitter<PcapRequest>();

  private validIp: RegExp = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}$/;
  private validPort: RegExp = /^([0-9]{1,4}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/;

  filterForm = new FormGroup({
    startTime: new FormControl(moment(DEFAULT_START_TIME).format(DEFAULT_TIMESTAMP_FORMAT), dateRangeValidator),
    endTime: new FormControl(moment(DEFAULT_END_TIME).format(DEFAULT_TIMESTAMP_FORMAT), dateRangeValidator),
    ipSrcAddr: new FormControl('', Validators.pattern(this.validIp)),
    ipSrcPort: new FormControl('', Validators.pattern(this.validPort)),
    ipDstAddr: new FormControl('', Validators.pattern(this.validIp)),
    ipDstPort: new FormControl('', Validators.pattern(this.validPort)),
    protocol: new FormControl(),
    includeReverse: new FormControl(),
    packetFilter: new FormControl(),
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['model']) {
      const newModel: PcapRequest = changes['model'].currentValue;
      const controlValue = transformModelToControlValue(newModel);
      this.filterForm.setValue(controlValue);
    }
  }

  onSubmit() {
    const pcapRequest = transformControlValueToModel(this.filterForm);
    this.search.emit(pcapRequest);
  }
}
