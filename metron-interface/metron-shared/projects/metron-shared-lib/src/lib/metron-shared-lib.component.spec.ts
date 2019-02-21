import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MetronSharedLibComponent } from './metron-shared-lib.component';

describe('MetronSharedLibComponent', () => {
  let component: MetronSharedLibComponent;
  let fixture: ComponentFixture<MetronSharedLibComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MetronSharedLibComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MetronSharedLibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
