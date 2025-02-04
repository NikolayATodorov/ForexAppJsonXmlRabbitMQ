import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, Subject, from } from 'rxjs';

import { ExchangeRateService } from '../service/exchange-rate.service';
import { IExchangeRate } from '../exchange-rate.model';
import { ExchangeRateFormService } from './exchange-rate-form.service';

import { ExchangeRateUpdateComponent } from './exchange-rate-update.component';

describe('ExchangeRate Management Update Component', () => {
  let comp: ExchangeRateUpdateComponent;
  let fixture: ComponentFixture<ExchangeRateUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let exchangeRateFormService: ExchangeRateFormService;
  let exchangeRateService: ExchangeRateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ExchangeRateUpdateComponent],
      providers: [
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            params: from([{}]),
          },
        },
      ],
    })
      .overrideTemplate(ExchangeRateUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(ExchangeRateUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    exchangeRateFormService = TestBed.inject(ExchangeRateFormService);
    exchangeRateService = TestBed.inject(ExchangeRateService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should update editForm', () => {
      const exchangeRate: IExchangeRate = { id: 456 };

      activatedRoute.data = of({ exchangeRate });
      comp.ngOnInit();

      expect(comp.exchangeRate).toEqual(exchangeRate);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IExchangeRate>>();
      const exchangeRate = { id: 123 };
      jest.spyOn(exchangeRateFormService, 'getExchangeRate').mockReturnValue(exchangeRate);
      jest.spyOn(exchangeRateService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ exchangeRate });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: exchangeRate }));
      saveSubject.complete();

      // THEN
      expect(exchangeRateFormService.getExchangeRate).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(exchangeRateService.update).toHaveBeenCalledWith(expect.objectContaining(exchangeRate));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IExchangeRate>>();
      const exchangeRate = { id: 123 };
      jest.spyOn(exchangeRateFormService, 'getExchangeRate').mockReturnValue({ id: null });
      jest.spyOn(exchangeRateService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ exchangeRate: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: exchangeRate }));
      saveSubject.complete();

      // THEN
      expect(exchangeRateFormService.getExchangeRate).toHaveBeenCalled();
      expect(exchangeRateService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IExchangeRate>>();
      const exchangeRate = { id: 123 };
      jest.spyOn(exchangeRateService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ exchangeRate });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(exchangeRateService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
