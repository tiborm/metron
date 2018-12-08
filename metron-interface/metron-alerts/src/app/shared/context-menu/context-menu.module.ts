import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContextMenuOriginDirective } from './context-menu-origin.directive';
import { ContextMenuComponent } from './context-menu.component';
import { ContextMenuService } from './context-menu.service';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    ContextMenuOriginDirective,
    ContextMenuComponent,
  ],
  exports: [
    ContextMenuOriginDirective,
    ContextMenuComponent,
  ],
  providers: [
    ContextMenuService
  ]
})
export class ContextMenuModule { }
