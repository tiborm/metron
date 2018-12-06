import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContextMenuDirective } from './context-menu.directive';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    ContextMenuDirective
  ],
  exports: [
    ContextMenuDirective
  ]
})
export class ContextMenuModule { }
