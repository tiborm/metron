import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable()
export class ContextMenuService {

  getConfig(): Observable<{}> {
    // TODO this here is the actual API definition
    return of({
      id: [{ label: 'id: dynamic menu item 01', urlPattern: '/{}'}],
      ip_src_addr: [{ label: 'ip_src_addr: dynamic menu item 02', urlPattern: '/{}'}],
      host: [{ label: 'host: dynamic menu item 01', urlPattern: '/{}'}],
    })
  }

  constructor(private http: HttpClient) { }
}
