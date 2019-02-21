import { NgModule } from '@angular/core';
import { MetronSharedLibComponent } from './metron-shared-lib.component';
import { CentralNavigationComponent } from './central-navigation/central-navigation.component';

@NgModule({
  imports: [
  ],
  declarations: [MetronSharedLibComponent, CentralNavigationComponent],
  exports: [MetronSharedLibComponent]
})
export class MetronSharedLibModule { }
