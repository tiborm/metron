import { TestBed, async } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { ContextMenuService } from './context-menu.service';
import { AppConfigService } from 'app/service/app-config.service';
import { Injectable } from '@angular/core';

const FAKE_CONFIG_SVC_URL = '/test/config/menu/url';

@Injectable()
class FakeAppConfigService {
  constructor() {}

  getContextMenuConfigURL() {
    return FAKE_CONFIG_SVC_URL;
  }
}

describe('ContextMenuService', () => {

  let contextMenuSvc: ContextMenuService;
  let mockBackend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [
        ContextMenuService,
        { provide: AppConfigService, useClass: FakeAppConfigService }
      ]
    }).compileComponents();

    contextMenuSvc = TestBed.get(ContextMenuService);
    mockBackend = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    expect(contextMenuSvc).toBeTruthy();
  });

  it('should invoke context menu endpoint only once', () => {
    contextMenuSvc.getConfig().subscribe((result) => {
      expect(req.request.method).toEqual('GET');
    });

    const req = mockBackend.expectOne(FAKE_CONFIG_SVC_URL);
    req.flush({ menuKey: [] });
  });

  it('getConfig() should return with the result of config svc', () => {
    contextMenuSvc.getConfig().subscribe((result) => {
      expect(result).toEqual({ menuKey: [] });
    });

    const req = mockBackend.expectOne(FAKE_CONFIG_SVC_URL);
    req.flush({ menuKey: [] });
  })

  it('should cache the first response', () => {
    contextMenuSvc.getConfig().subscribe((first) => {
      contextMenuSvc.getConfig().subscribe((second) => {
        expect(first).toBe(second);
      });
    });

    const req = mockBackend.expectOne(FAKE_CONFIG_SVC_URL);
    req.flush({ menuKey: [] });
  })
});
