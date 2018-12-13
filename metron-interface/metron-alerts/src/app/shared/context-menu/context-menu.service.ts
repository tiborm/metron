import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable()
export class ContextMenuService {

  getConfig(): Observable<{}> {
    // TODO the following JSON is the actual API response design
    return of({
      alertEntry: [
        {
          label: 'Internal ticketing system',
          urlPattern: '/{}',
        }
      ],
      id: [
        {
          label: 'Dynamic menu item 01',
          urlPattern: '/{}',
        }
      ],
      ip_src_addr: [
        {
          label: 'IP Investigation Notebook',
          urlPattern: 'http://zepellin.example.com:9000/notebook/BLAHBAH?ip={}',
        },
        {
          label: 'IP Conversation Investigation',
          urlPattern: 'http://zepellin.example.com:9000/notebook/BLAHBAH?ip_src_addr={ip_src_addr}&ip_dst_addr={ip_dst_addr}',
        },
      ],
      ip_dst_addr: [
        {
          label: 'IP Investigation Notebook',
          urlPattern: 'http://zepellin.example.com:9000/notebook/BLAHBAH?ip={}',
        },
        {
          label: 'IP Conversation Investigation',
          urlPattern: 'http://zepellin.example.com:9000/notebook/BLAHBAH?ip_src_addr={ip_src_addr}&ip_dst_addr={ip_dst_addr}',
        },
      ],
      host: [
        {
          label: 'Whois Reputation Service',
          urlPattern: 'https://www.whois.com/whois/{}',
        }
      ],
    })
  }

  constructor(private http: HttpClient) { }
}
