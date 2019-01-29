import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ContextMenuComponent } from './context-menu.component';
import { ContextMenuService } from './context-menu.service';
import { Component } from '@angular/core';


@Component({
  template: `
    <div id="hostComp" withContextMenu>
      Context Menu Test In Progress...
    </div>
  `
})
class HostComponent {}

fdescribe('ContextMenuComponent', () => {
  let component: ContextMenuComponent;
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      declarations: [ ContextMenuComponent, HostComponent ],
      providers: [ ContextMenuService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    component = TestBed.createComponent(ContextMenuComponent).componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  })

  it('should create', () => {
    expect(fixture).toBeTruthy();
    expect(component).toBeTruthy();
  });

  it('should show context menu on left click', () => {
    fixture.nativeElement.querySelector('#hostComp').click();

    expect(document.body.querySelector('.dropdown-menu'));
  });

  it('sould close context menu if user clicks outside of it', (done) => {
    fixture.nativeElement.querySelector('[data-qe-id="cm-dropdown"]').click();
    expect(document.body.querySelector('.dropdown-menu')).toBeTruthy();

    (document.body.querySelector('[data-qe-id="cm-outside"]') as HTMLElement).click();

    setTimeout(() => {
      // FIXME this not works even with the time out
      // click handler of line #55 not invoked
      expect(document.body.querySelector('.dropdown-menu')).toBeFalsy();
      done();
    }, 300);

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
