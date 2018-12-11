import { Component, ContentChild, AfterContentInit, OnDestroy, ViewChild, ElementRef, Renderer2, HostListener, Input } from '@angular/core';
import { ContextMenuService } from './context-menu.service';
import { Subscriber, Subscription, fromEvent, Subject } from 'rxjs';
import Popper from 'popper.js';
import { takeUntil, filter } from 'rxjs/operators';

@Component({
  selector: '[withContextMenu]',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.scss']
})
export class ContextMenuComponent implements  AfterContentInit, OnDestroy {

  @ViewChild('dropDown') dropDown: ElementRef;
  @ViewChild('clickOutsideCanvas') outside: ElementRef;

  @Input() predefinedItems: { label: string, event: string }[];
  @Input() menuTitle: string;
  @Input() menuConfigId: string;
  @Input() data: any;

  private destroyed$: Subject<boolean> = new Subject<boolean>();

  private popper: Popper;

  constructor(
    private contextMenuSvc: ContextMenuService,
    private el: ElementRef,
    private renderer: Renderer2
    ) {}

  ngAfterContentInit() {
    this.subscribeTo();
  }

  private subscribeTo() {
    fromEvent(this.el.nativeElement, 'click')
      .pipe(takeUntil(this.destroyed$))
      .subscribe(this.open.bind(this));

    fromEvent(this.outside.nativeElement, 'click')
      // .pipe(takeUntil(this.destroyed$)) FIXME: why is this kills the subscription but not with the origin.click
      .subscribe(this.close.bind(this));
  }

  // TODO: make open/close to a toggleMenu Fn
  private open($event: MouseEvent) {
    $event.stopPropagation();
    // TODO would be better to do this whith *ngIf (heavn't found a way to attach poper to it yet)
    document.body.appendChild(this.dropDown.nativeElement); // somehow disappear after 2 sec without this
    document.body.appendChild(this.outside.nativeElement); // somehow disappear after 2 sec without this
    this.renderer.setStyle(this.dropDown.nativeElement, 'display', 'block');
    this.renderer.setStyle(this.outside.nativeElement, 'display', 'block');
    this.popper = new Popper(this.el.nativeElement, this.dropDown.nativeElement, { placement: 'bottom-start' });
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

  dispatchMenuEvent(event: string) {
    this.close();
    this.el.nativeElement.dispatchEvent(new CustomEvent(event));
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}
