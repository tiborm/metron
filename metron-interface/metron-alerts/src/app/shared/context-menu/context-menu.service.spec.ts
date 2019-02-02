import { TestBed, async } from '@angular/core/testing';
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
      imports: [ HttpClientTestingModule ],
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
    contextMenuSvc.getConfig().subscribe((result) => {
      expect(req.request.method).toEqual('GET');
    });

    const req = mockBackend.expectOne(ContextMenuService.CONFIG_SVC_URL);
    req.flush({ menuKey: [] });
  });

  it('getConfig() should return with the result of config svc', () => {
    contextMenuSvc.getConfig().subscribe((result) => {
      expect(result).toEqual({ menuKey: [] });
    });

    const req = mockBackend.expectOne(ContextMenuService.CONFIG_SVC_URL);
    req.flush({ menuKey: [] });
  })

  it('should cache the first response', () => {
    contextMenuSvc.getConfig().subscribe((first) => {
      contextMenuSvc.getConfig().subscribe((second) => {
        expect(first).toBe(second);
      });
    });

    const req = mockBackend.expectOne(ContextMenuService.CONFIG_SVC_URL);
    req.flush({ menuKey: [] });
  })
});
