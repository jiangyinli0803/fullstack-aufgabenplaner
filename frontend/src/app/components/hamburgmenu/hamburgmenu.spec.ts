import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hamburgmenu } from './hamburgmenu';

describe('Hamburgmenu', () => {
  let component: Hamburgmenu;
  let fixture: ComponentFixture<Hamburgmenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Hamburgmenu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Hamburgmenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
