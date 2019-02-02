import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ContextMenuComponent } from './context-menu.component';
import { ContextMenuService } from './context-menu.service';
import { Component } from '@angular/core';


@Component({
  template: `
    <div id="hostComp" withContextMenu
      menuConfigId="testMenuConfigId"
      menuTitle="This is a test"
      [predefinedItems]="[{ label: 'Show details', event: 'menuEventShowDetails'}]"
      (menuEventShowDetails)="showDetails($event, alert)"
      [data]="{ testData: 'testValue' }">
      Context Menu Test In Progress...
    </div>
  `
})
class TestComponent {}

fdescribe('ContextMenuComponent', () => {
  let component: ContextMenuComponent;
  let fixture: ComponentFixture<TestComponent>;

  let mockBackend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      declarations: [ ContextMenuComponent, TestComponent ],
      providers: [ ContextMenuService ]
    })
    .compileComponents();

    // FIXME: Why there is no error message config svc returns undefined? It's only occures in test conditions.
    // mockBackend = TestBed.get(HttpTestingController);
    // const req = mockBackend.expectOne(ContextMenuService.CONFIG_SVC_URL);
    // req.flush({ menuKey: [] });

    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  })

  it('should create', () => {
    expect(fixture).toBeTruthy();
  });

  it('should show context menu on left click', () => {
    fixture.nativeElement.querySelector('#hostComp').click();

    fixture.detectChanges();
    expect(document.body.querySelector('[data-qe-id="cm-dropdown"]')).toBeTruthy();
  });

  it('sould close context menu if user clicks outside of it', () => {
    fixture.nativeElement.querySelector('#hostComp').click();
    fixture.detectChanges();

    expect(document.body.querySelector('[data-qe-id="cm-dropdown"]')).toBeTruthy();

    (document.body.querySelector('[data-qe-id="cm-outside"]') as HTMLElement).click();
    fixture.detectChanges();

    expect(document.body.querySelector('.dropdown-menu')).toBeFalsy();
  });

  it('sould contains predefined menu items', () => {

  });

  it('sould contains dymamic menu items', () => {

  });

  it('should destroy additional dom elements with the host component', () => {

  });

  it('should destroy subscriptions with the host component', () => {

  });

});
