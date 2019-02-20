import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-central-navigation',
  templateUrl: './central-navigation.component.html',
  styleUrls: ['./central-navigation.component.scss']
})

export class CentralNavigationComponent implements OnInit {
  @Input() links: CentralNavLink[];

  constructor() { }

  ngOnInit() {
  }

}

export class CentralNavLink {
  linkName: string;
  subLinks: CentralNavSublink[];
}

export class CentralNavSublink {
  linkName: string;
  routerLink: string;
}
