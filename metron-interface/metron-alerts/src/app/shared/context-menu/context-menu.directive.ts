import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[context-menu]'
})
export class ContextMenuDirective {

  constructor(el: ElementRef) { }

}
