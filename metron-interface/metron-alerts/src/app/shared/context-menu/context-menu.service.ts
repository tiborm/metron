import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpUtil } from 'app/utils/httpUtil';
import { AppConfigService } from 'app/service/app-config.service';

@Injectable()
export class ContextMenuService {
  private cachedConfig$: BehaviorSubject<{}>;

  getConfig(): Observable<{}> {
    if (!this.cachedConfig$) {
      this.cachedConfig$ = new BehaviorSubject({});

      this.http.get(this.appConfig.getContextMenuConfigURL())
      .pipe(
        map(HttpUtil.extractData),
        catchError(HttpUtil.handleError)
      ).subscribe((result) => {
        this.cachedConfig$.next(result);
      });
    }

    return this.cachedConfig$;
  }

  constructor(
    private http: HttpClient,
    private appConfig: AppConfigService
    ) {}
}
