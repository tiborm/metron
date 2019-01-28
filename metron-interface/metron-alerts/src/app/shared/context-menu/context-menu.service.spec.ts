import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { ContextMenuService } from './context-menu.service';

describe('ContextMenuService', () => {

  let contextMenuSvc: ContextMenuService;
  let mockBackend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ContextMenuService
      ]
    }).compileComponents();

    contextMenuSvc = TestBed.get(ContextMenuService);
    mockBackend = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    expect(contextMenuSvc).toBeTruthy();
  });

  it('should invoke context menu endpoint only once', () => {
    const req = mockBackend.expectOne(ContextMenuService.CONFIG_SVC_URL);
    expect(req.request.method).toEqual('GET');
  });

  it('getConfig() should return with the result of config svc', () => {
    const req = mockBackend.expectOne(ContextMenuService.CONFIG_SVC_URL);
    req.flush({ menuKey: [] });

    contextMenuSvc.getConfig().subscribe((result) => {
      expect(result).toEqual({ menuKey: [] });
    });
  })

  it('should cache the first response', () => {
    const req = mockBackend.expectOne(ContextMenuService.CONFIG_SVC_URL);
    req.flush({ menuKey: [] });

    contextMenuSvc.getConfig().subscribe((first) => {
      contextMenuSvc.getConfig().subscribe((second) => {
        expect(first).toBe(second);
      });
    });
  })
});
