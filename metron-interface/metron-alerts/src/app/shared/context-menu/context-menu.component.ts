import {
  Component,
  AfterContentInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  Input,
  OnInit
} from '@angular/core';
import { ContextMenuService } from './context-menu.service';
import { fromEvent, Subject } from 'rxjs';
import Popper from 'popper.js';
import { takeUntil, map } from 'rxjs/operators';
import { DynamicMenuItem } from './dynamic-item.model';

@Component({
  selector: '[ctxMenu]',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.scss']
})
export class ContextMenuComponent implements OnInit, AfterContentInit, OnDestroy {

  @ViewChild('contextMenuDropDown') dropDown: ElementRef;
  @ViewChild('clickOutsideCanvas') outside: ElementRef;

  @Input() ctxMenuItems: { label: string, event: string }[];
  @Input() ctxMenuTitle: string;
  @Input() ctxMenuId: string;
  @Input() ctxMenuData: any;

  dynamicMenuItems: DynamicMenuItem[] = [];

  isOpen = false;

  private destroyed$: Subject<boolean> = new Subject<boolean>();

  private popper: Popper;

  constructor(
    private contextMenuSvc: ContextMenuService,
    private host: ElementRef
    ) {}

  ngOnInit() {
    this.fetchContextMenuConfig();
  }

  ngAfterContentInit() {
    this.subscribeTo();
  }

  private fetchContextMenuConfig() {
    this.contextMenuSvc.getConfig()
      .pipe(map((allConfigs: {}) => allConfigs[this.ctxMenuId]))
      .subscribe((config: { label: string, urlPattern: string }[]) => {
        this.dynamicMenuItems = config ? config.reduce((validConfigs, configItem) => {
          if (DynamicMenuItem.isConfigValid(configItem)) {
            validConfigs.push(new DynamicMenuItem(configItem));
          }
          return validConfigs;
        }, []) : [];
      });
  }

  private subscribeTo() {
    fromEvent(this.host.nativeElement, 'click')
      .pipe(takeUntil(this.destroyed$))
      .subscribe(this.toggle.bind(this));
  }

  private toggle($event: MouseEvent) {
    $event.stopPropagation();

    if (this.isOpen) {
      if (this.popper) {
        this.popper.destroy();
      }
      this.isOpen = false;
      return;
    }

    const origin = this.getContextMenuOrigin($event);
    this.isOpen = true;

    let mutationObserver = new MutationObserver((mutations) => {
      if (document.body.contains(this.dropDown.nativeElement)) {
        mutationObserver.disconnect();
        mutationObserver = null;

        this.popper = new Popper(origin, this.dropDown.nativeElement, { placement: 'bottom-start' });
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

  onPredefinedItemClicked($event: MouseEvent, eventName: string) {
    this.host.nativeElement.dispatchEvent(new Event(eventName));
  }

  onDynamicItemClicked($event: MouseEvent, url: string) {
    window.open(this.parseUrlPattern(url, this.ctxMenuData));
  }

  private parseUrlPattern(url = '', data = {}, delimeter: RegExp = /{|}/): string {
    return url.replace('{}', `{${this.ctxMenuId}}`)
      .split(delimeter).map((urlSegment) => {
        return data[urlSegment] || urlSegment;
    }).join('');
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
