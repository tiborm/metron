import { Component } from '@angular/core';
import { ImplicitFiltersService } from '../service/ImplicitFiltersService';

@Component({
  selector: 'app-show-hide-alert-entries',
  template: `
    <app-switch [text]="'HIDE Resolved Alerts'" (onChange)="onVisibilityChanged('RESOLVE', $event)"> </app-switch>
    <app-switch [text]="'HIDE Dismissed Alerts'" (onChange)="onVisibilityChanged('DISMISS', $event)"> </app-switch>
  `,
  styles: ['']
})
export class ShowHideAlertEntriesComponent {

  constructor(private implicitFiltersService: ImplicitFiltersService) {}

  onVisibilityChanged(alertStatus, isExcluded) {
    console.log(alertStatus, isExcluded);
  }

}
