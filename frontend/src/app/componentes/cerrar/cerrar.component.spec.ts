import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CerrarComponent } from './cerrar.component';

describe('CerrarComponent', () => {
  let component: CerrarComponent;
  let fixture: ComponentFixture<CerrarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CerrarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CerrarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
