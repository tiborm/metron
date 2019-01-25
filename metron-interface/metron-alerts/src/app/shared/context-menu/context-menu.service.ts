import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpUtil } from 'app/utils/httpUtil';

@Injectable()
export class ContextMenuService {

  private readonly CONFIG_SVC_URL = '/assets/context-menu.conf.json';

  public cachedConfig$: BehaviorSubject<{}> = new BehaviorSubject({});

  getConfig(): Observable<{}> {
    return this.cachedConfig$;
  }

  constructor(private http: HttpClient) {
    this.http.get(this.CONFIG_SVC_URL)
      .pipe(
        map(HttpUtil.extractData),
        catchError(HttpUtil.handleError)
      ).subscribe((result) => {
        this.cachedConfig$.next(result);
      });
  }
}
