import {
  Component,
  AfterContentInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  Renderer2,
  Input,
  OnInit
} from '@angular/core';
import { ContextMenuService } from './context-menu.service';
import { fromEvent, Subject } from 'rxjs';
import Popper from 'popper.js';
import { takeUntil, map, take } from 'rxjs/operators';

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

  isOpen = false;

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
  }

  // TODO: make open/close to a toggleMenu Fn
  private open($event: MouseEvent) {
    $event.stopPropagation();
    const origin = this.getContextMenuOrigin($event);
    this.isOpen = true;

    let mutationObserver = new MutationObserver((mutations) => {
      if (document.body.contains(this.dropDown.nativeElement)) {
        mutationObserver.disconnect();
        mutationObserver = null;

        this.popper = new Popper(origin, this.dropDown.nativeElement, { placement: 'bottom-start' });

        fromEvent(this.outside.nativeElement, 'click')
          .pipe(take(1))
          .subscribe(this.close.bind(this));
      }
    });
    mutationObserver.observe(document.body, {
      attributes: false,
      childList: true,
      characterData: false,
      subtree: true}
    );
  }

  private getContextMenuOrigin($event: MouseEvent): HTMLElement {
    if (($event.currentTarget as HTMLElement).contains($event.target as Node)) {
      return $event.target as HTMLElement;
    } else {
      return $event.currentTarget as HTMLElement;
    }
  }

  private close($event?: MouseEvent) {
    if ($event) {
      $event.stopPropagation();
    }

    if (this.popper) {
      this.popper.destroy();
    }

    this.isOpen = false;
  }

  onPredefinedItemClicked($event: MouseEvent, eventName: string) {
    this.close($event);
    this.host.nativeElement.dispatchEvent(new CustomEvent(eventName));
  }

  onDynamicItemClicked($event: MouseEvent, url: string) {
    this.close($event);
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
