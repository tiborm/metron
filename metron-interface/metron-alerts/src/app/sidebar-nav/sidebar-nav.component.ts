import { Component, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'metron-config-sidebar-nav',
  templateUrl: './sidebar-nav.component.html',
  styleUrls: ['./sidebar-nav.component.scss']
})
export class SidebarNavComponent implements OnInit {
  @Output() open: EventEmitter<any> = new EventEmitter();
  currentlyOpen = true;

  constructor() { }

  ngOnInit() {
  }

  toggleMainWidth() {
    this.currentlyOpen = !this.currentlyOpen;
    this.currentlyOpen === true ? this.open.next(true) : this.open.next(false);
  }

}
