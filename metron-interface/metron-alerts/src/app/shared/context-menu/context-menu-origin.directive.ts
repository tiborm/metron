import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { fromEvent } from 'rxjs';

@Directive({
  selector: '[contextMenuOrigin]'
})
export class ContextMenuOriginDirective {

  click = fromEvent(this.element, 'click');

  @Input() options: { contextId: string, value: string }

  constructor(public host: ElementRef) {}

  get element() {
    return this.host.nativeElement;
  }

}
