import { Component, AfterContentInit, OnDestroy, ViewChild, ElementRef, Renderer2, Input, OnInit } from '@angular/core';
import { ContextMenuService } from './context-menu.service';
import { fromEvent, Subject, Observable } from 'rxjs';
import Popper from 'popper.js';
import { takeUntil, map } from 'rxjs/operators';

// TODO: extract this class
export class DynamicMenuItem {

  label: string;
  private urlPattern: string;

  constructor(readonly config: { label: string, urlPattern: string }) {
    if (this.isValid(config)) {
      this.label = config.label;
      this.urlPattern = config.urlPattern;
    };
  }

  get url() {
    return this.urlPattern
  }

  /**
   * Validating server respons and logging error if something required missing.
   *
   * @param config {} Menu config object received from and endpoint.
   */
  private isValid(config: {}) {
    return ['label', 'urlPattern'].every((requiredField) => {
      if (config.hasOwnProperty(requiredField)) {
        return true;
      } else {
        console.error(`[context-menu] Service returned with a incomplete config object. Missing field: ${requiredField}`);
      }
    })
  }
}

@Component({
  selector: '[withContextMenu]',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.scss']
})
export class ContextMenuComponent implements OnInit, AfterContentInit, OnDestroy {

  @ViewChild('contextMenuDropDown') dropDown: ElementRef;
  @ViewChild('clickOutsideCanvas') outside: ElementRef;

  @Input() predefinedItems: { label: string, event: string }[];
  @Input() menuTitle: string;
  @Input() menuConfigId: string;

  @Input() data: any;
  dynamicMenuItems: DynamicMenuItem[] = [];

  private destroyed$: Subject<boolean> = new Subject<boolean>();

  private popper: Popper;

  constructor(
    private contextMenuSvc: ContextMenuService,
    private host: ElementRef,
    private renderer: Renderer2
    ) {}

  ngOnInit() {
    this.fetchContextMenuConfig();
  }

  ngAfterContentInit() {
    this.subscribeTo();
  }

  private fetchContextMenuConfig() {
    this.contextMenuSvc.getConfig()
      .pipe(map((allConfigs: {}) => allConfigs[this.menuConfigId]))
      .subscribe((config: { label: string, urlPattern: string }[]) => {
        this.dynamicMenuItems = config ? config.map(
          menuConfig => new DynamicMenuItem(menuConfig)
        ) : []
      });
  }

  private subscribeTo() {
    fromEvent(this.host.nativeElement, 'click')
      .pipe(takeUntil(this.destroyed$))
      .subscribe(this.open.bind(this));

    fromEvent(this.outside.nativeElement, 'click')
      .pipe(takeUntil(this.destroyed$))
      .subscribe(this.close.bind(this));
  }

  // TODO: make open/close to a toggleMenu Fn
  private open($event: MouseEvent) {
    const origin = this.getContextMenuOrigin($event);
    // TODO would be better to do this whith *ngIf (heavn't found a way to attach poper to it yet)
    document.body.appendChild(this.dropDown.nativeElement); // somehow disappear after 2 sec without this
    document.body.appendChild(this.outside.nativeElement); // somehow disappear after 2 sec without this
    this.renderer.setStyle(this.dropDown.nativeElement, 'display', 'block');
    this.renderer.setStyle(this.outside.nativeElement, 'display', 'block');
    this.popper = new Popper(origin, this.dropDown.nativeElement, { placement: 'bottom-start' });
  }

  private getContextMenuOrigin($event: MouseEvent): HTMLElement {
    $event.stopPropagation();
    if (($event.currentTarget as HTMLElement).contains($event.target as Node)) {
      return $event.target as HTMLElement;
    } else {
      return $event.currentTarget as HTMLElement;
    }
  }

  private close() {
    if (this.popper) {
      this.popper.destroy();
    }

    try {
      document.body.removeChild(this.dropDown.nativeElement);
      document.body.removeChild(this.outside.nativeElement);
    } catch {}

    this.renderer.setStyle(this.dropDown.nativeElement, 'display', 'none');
    this.renderer.setStyle(this.outside.nativeElement, 'display', 'none');
  }

  dispatchMenuEvent(event: string) {
    this.close();
    this.host.nativeElement.dispatchEvent(new CustomEvent(event));
  }

  dynamicItemClicked($event: MouseEvent, url: string) {
    this.close();
    window.open(this.parseUrlPattern(url, this.data));
  }

  private parseUrlPattern(url = '', data = {}, delimeter: RegExp = /{|}/): string {
    return url.replace('{}', `{${this.menuConfigId}}`)
      .split(delimeter).map((urlSegment) => {
        return data[urlSegment] || urlSegment;
    }).join('');
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();

    this.close();
  }

}
