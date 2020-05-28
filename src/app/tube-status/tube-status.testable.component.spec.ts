import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { StatusIndicatorService, TubeStatusComponent, TflApiService } from './tube-status.testable.component';

describe('StatusIndicatorService', () => {

  let service = new StatusIndicatorService()

  it('should return no idea', () => {
    expect(service.statusIndicatorFor([])).toEqual(['❓', 'no idea']);
  });

  it('should return tick box', () => {
    expect(
      service.statusIndicatorFor(
        [{ statusSeverity: 0, statusSeverityDescription: "not bad" }]
      )
    ).toEqual(['✅', 'not bad']);
  })

  it('should return bad', () => {
    expect(
      service.statusIndicatorFor(
        [
          { statusSeverity: 0, statusSeverityDescription: "not bad" },
          { statusSeverity: 30, statusSeverityDescription: "very bad" }
        ]
      )
    ).toEqual(['❌', 'very bad']);
  })

  it('should throw an error bad', () => {
    expect(
      () => service.statusIndicatorFor(null)
    ).toThrowError("cannot process null list of statuses");
  })

});



describe('TubeStatusComponent', () => {
  const tflApiService = jasmine.createSpyObj('TflApiService', ['downloadStatus']);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TubeStatusComponent ],
      providers: [ { provide: TflApiService, useValue: tflApiService } ],
      imports: [ HttpClientTestingModule ]
    })
    .compileComponents();
  }));


  it('should render single tube line fake async', fakeAsync(() => {
    tflApiService.downloadStatus.and.returnValue(of([{ id: 'my-test-line' }]));
    let fixture = TestBed.createComponent(TubeStatusComponent);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    let compiled = fixture.nativeElement;
    expect(compiled.querySelector('li').textContent).toContain('my-test-line');
  }));

  it('should render single tube line', () => {
    tflApiService.downloadStatus.and.returnValue(of([{ id: 'my-test-line' }]));
    let fixture = TestBed.createComponent(TubeStatusComponent);
    fixture.detectChanges();
    let compiled = fixture.nativeElement;
    expect(compiled.querySelector('li').textContent).toContain('my-test-line');
  });


  it('should render multiple tube lines', () => {
    tflApiService.downloadStatus.and.returnValue(of([{ id: 'my-first-line' }, { id: 'my-second-line' }]));
    let fixture = TestBed.createComponent(TubeStatusComponent);
    fixture.detectChanges();
    let compiled = fixture.nativeElement;

    let listElements = compiled.querySelectorAll('li');
    expect(listElements.length).toBe(2);
    expect(listElements[0].textContent).toContain('my-first-line');
    expect(listElements[1].textContent).toContain('my-second-line');
  });
});