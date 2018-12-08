import { Component, ContentChild, AfterContentInit, OnDestroy, ViewChild, ElementRef, Renderer2, HostListener } from '@angular/core';
import { ContextMenuOriginDirective } from './context-menu-origin.directive';
import { ContextMenuService } from './context-menu.service';
import { Subscriber, Subscription, fromEvent, Subject } from 'rxjs';
import Popper from 'popper.js';
import { takeUntil, filter } from 'rxjs/operators';

@Component({
  selector: 'context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.scss']
})
export class ContextMenuComponent implements  AfterContentInit, OnDestroy {

  @ContentChild(ContextMenuOriginDirective) origin: ContextMenuOriginDirective;
  @ViewChild('dropDown') dropDown: ElementRef;
  @ViewChild('clickOutsideCanvas') outside: ElementRef;

  private destroyed$: Subject<boolean> = new Subject<boolean>();

  private popper: Popper;

  constructor(
    private contextMenuSvc: ContextMenuService,
    private host: ElementRef,
    private renderer: Renderer2
    ) {}

  ngAfterContentInit() {
    this.origin.click
      .pipe(takeUntil(this.destroyed$))
      .subscribe(this.open.bind(this));

    fromEvent(this.outside.nativeElement, 'click')
      .pipe(takeUntil(this.destroyed$))
      .subscribe(this.close.bind(this));
  }

  private open() {
    document.body.appendChild(this.dropDown.nativeElement); // somehow disappear after 2 sec without this
    document.body.appendChild(this.outside.nativeElement); // somehow disappear after 2 sec without this
    this.renderer.setStyle(this.dropDown.nativeElement, 'display', 'block');
    this.renderer.setStyle(this.outside.nativeElement, 'display', 'block');
    this.popper = new Popper(this.origin.element, this.dropDown.nativeElement, { placement: 'bottom-start' });
  }

  private close() {
    if (this.popper) {
      this.popper.destroy();
    }
    document.body.removeChild(this.dropDown.nativeElement);
    document.body.removeChild(this.outside.nativeElement);
    this.renderer.setStyle(this.dropDown.nativeElement, 'display', 'none');
    this.renderer.setStyle(this.outside.nativeElement, 'display', 'none');
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}
