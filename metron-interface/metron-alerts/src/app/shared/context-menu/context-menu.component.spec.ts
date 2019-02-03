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
    component = fixture.componentInstance as ContextMenuComponent;
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

  it('should close context menu if user clicks outside of it', () => {
    fixture.nativeElement.querySelector('#hostComp').click();
    fixture.detectChanges();

    expect(document.body.querySelector('[data-qe-id="cm-dropdown"]')).toBeTruthy();

    (document.body.querySelector('[data-qe-id="cm-outside"]') as HTMLElement).click();
    fixture.detectChanges();

    expect(document.body.querySelector('.dropdown-menu')).toBeFalsy();
  });

  it('should render predefined menu items', () => {
    fixture.nativeElement.querySelector('#hostComp').click();
    fixture.detectChanges();

    expect(document.body.querySelector('[data-qe-id="cm-predefined-item"]')).toBeTruthy();
  });

  it('should render multiple predefined menu items', () => {
    component.predefinedItems = [
      { label: 'test item #1', event: ''},
      { label: 'test item #2', event: ''}
    ];

    fixture.detectChanges();

    fixture.nativeElement.querySelector('#hostComp').click();
    fixture.detectChanges();

    expect(document.body.querySelectorAll('[data-qe-id="cm-predefined-item"]').length).toBe(2);
  });

  it('predefined menu item should render label', () => {
    fixture.nativeElement.querySelector('#hostComp').click();
    fixture.detectChanges();

    expect(document.body.querySelector('[data-qe-id="cm-predefined-item"]').firstChild.textContent).toBe('Show details');
  });

  it('should emit the configured event if user clicks on predefined menu item', () => {

  });

  it('should contains dymamic menu items', () => {

  });

  // dynamic should render lable
  // should invoke window.open
  // should parse the url

  it('should destroy additional dom elements with the host component', () => {

  });

  it('should destroy subscriptions with the host component', () => {

  });

});
