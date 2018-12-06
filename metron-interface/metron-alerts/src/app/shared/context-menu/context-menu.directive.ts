import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[context-menu]'
})
export class ContextMenuDirective {

  @Input() fieldName: string;

  constructor(el: ElementRef) {}

  @HostListener('click', ['$event']) onLeftClick($event) {
    console.log($event.target);
  }

}
