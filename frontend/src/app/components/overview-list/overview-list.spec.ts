import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverviewList } from './overview-list';

describe('OverviewList', () => {
  let component: OverviewList;
  let fixture: ComponentFixture<OverviewList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverviewList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OverviewList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
