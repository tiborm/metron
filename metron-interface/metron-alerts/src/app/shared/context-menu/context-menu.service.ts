import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpUtil } from 'app/utils/httpUtil';

@Injectable()
export class ContextMenuService {

  public static readonly CONFIG_SVC_URL = '/assets/context-menu.conf.json';

  private cachedConfig$: Subject<{}>;

  getConfig(): Observable<{}> {
    if (!this.cachedConfig$) {
      this.cachedConfig$ = new Subject();

      this.http.get(ContextMenuService.CONFIG_SVC_URL)
      .pipe(
        map(HttpUtil.extractData),
        catchError(HttpUtil.handleError)
      ).subscribe((result) => {
        this.cachedConfig$.next(result);
      });
    }

    return this.cachedConfig$;
  }

  // FIXME: you cant mock a xhr call if it's initiated in an svc constructor
  constructor(private http: HttpClient) {}
}
