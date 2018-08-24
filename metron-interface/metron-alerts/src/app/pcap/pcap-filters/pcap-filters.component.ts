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
import { DEFAULT_START_TIME, DEFAULT_END_TIME, DEFAULT_TIMESTAMP_FORMAT } from '../../utils/constants';

import { PcapRequest } from '../model/pcap.request';

function dateRangeValidator(dateRangeGroup: FormGroup): ValidationErrors | null {
  if (!dateRangeGroup.parent) {
    return null;
  }

  const startTimeMs = new Date(dateRangeGroup.controls['startTime'].value).getTime();
  const endTimeMs = new Date(dateRangeGroup.controls['endTime'].value).getTime();

  if (startTimeMs > endTimeMs || endTimeMs > new Date().getTime()) {
    return { error: 'Selected date range is invalid.' };
  }
  return null;
}

function transformPcapRequestToFormGroupValue(model: PcapRequest): PcapFilterFormValue {
  const startTimeStr = moment(model.startTimeMs > 0 ? model.startTimeMs : DEFAULT_START_TIME).format(DEFAULT_TIMESTAMP_FORMAT);
  let endTimeStr = moment(model.endTimeMs).format(DEFAULT_TIMESTAMP_FORMAT);
  if (isNaN((new Date(model.endTimeMs).getTime()))) {
    endTimeStr = moment(DEFAULT_END_TIME).format(DEFAULT_TIMESTAMP_FORMAT);
  } else {
    endTimeStr = moment(model.endTimeMs).format(DEFAULT_TIMESTAMP_FORMAT);
  }

  return {
    dateRange: {
      startTime: startTimeStr,
      endTime: endTimeStr,
    },
    ipSrcAddr: model.ipSrcAddr,
    ipDstAddr: model.ipDstAddr,
    ipSrcPort: model.ipSrcPort ? String(model.ipSrcPort) : '',
    ipDstPort: model.ipDstPort ? String(model.ipDstPort) : '',
    protocol: model.protocol,
    includeReverse: model.includeReverse,
    packetFilter: model.packetFilter
  };
}

function transformFormGroupValueToPcapRequest(form: FormGroup): PcapRequest {
  const pcapRequest = new PcapRequest();
  pcapRequest.startTimeMs = new Date((form.controls.dateRange as FormGroup).controls.startTime.value).getTime();
  pcapRequest.endTimeMs = new Date((form.controls.dateRange as FormGroup).controls.endTime.value).getTime();
  pcapRequest.ipSrcAddr = form.value.ipSrcAddr;
  pcapRequest.ipDstAddr = form.value.ipDstAddr;
  pcapRequest.ipSrcPort = form.value.ipSrcPort;
  pcapRequest.ipDstPort = form.value.ipDstPort;
  pcapRequest.protocol =  form.value.protocol;
  pcapRequest.includeReverse = form.value.includeReverse;
  pcapRequest.packetFilter = form.value.packetFilter;
  return pcapRequest;
}

export type PcapFilterFormValue = {
  dateRange: {
    startTime: string,
    endTime: string,
  },
  ipSrcAddr: string,
  ipDstAddr: string,
  ipSrcPort: string,
  ipDstPort: string,
  protocol: string,
  includeReverse: boolean,
  packetFilter: string
};

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
    dateRange: new FormGroup({
      startTime: new FormControl(moment(DEFAULT_START_TIME).format(DEFAULT_TIMESTAMP_FORMAT)),
      endTime: new FormControl(moment(DEFAULT_END_TIME).format(DEFAULT_TIMESTAMP_FORMAT)),
    }, dateRangeValidator),
    ipSrcAddr: new FormControl('', Validators.pattern(this.validIp)),
    ipSrcPort: new FormControl('', Validators.pattern(this.validPort)),
    ipDstAddr: new FormControl('', Validators.pattern(this.validIp)),
    ipDstPort: new FormControl('', Validators.pattern(this.validPort)),
    protocol: new FormControl(''),
    includeReverse: new FormControl(),
    packetFilter: new FormControl(''),
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['model']) {
      const newModel: PcapRequest = changes['model'].currentValue;
      const controlValue = transformPcapRequestToFormGroupValue(newModel);
      this.filterForm.setValue(controlValue);
    }
  }

  onSubmit() {
    const pcapRequest = transformFormGroupValueToPcapRequest(this.filterForm);
    this.search.emit(pcapRequest);
  }
}
