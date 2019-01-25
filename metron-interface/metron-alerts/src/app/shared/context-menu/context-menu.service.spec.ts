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

  it('should invoke context menu endpoint', () => {

  })
});
