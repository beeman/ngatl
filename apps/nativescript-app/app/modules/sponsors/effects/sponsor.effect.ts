// angular
import { Injectable } from '@angular/core';

// libs
import { Store, Action } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { Observable, of } from 'rxjs';
import { switchMap, map, catchError, withLatestFrom, startWith } from 'rxjs/operators';

// app
import { LoggerService } from '@ngatl/api';
import { AppActions, WindowService } from '@ngatl/core';
import { SponsorService } from '../services/sponsor.service';
import { SponsorActions } from '../actions/sponsor.action';

@Injectable()
export class SponsorEffects {

  @Effect()
  fetch$ = this.actions$
    .ofType(SponsorActions.ActionTypes.FETCH)
    .pipe(
    switchMap((action:SponsorActions.FetchAction) => this.sponsorService.fetch(action.payload)),
    map(value => {
      // console.log('fetched sponsors:', value);
      // console.log(JSON.stringify(value));

      return new SponsorActions.ChangedAction({
        list: value
      });
    }),
    catchError(err => of(new SponsorActions.ApiErrorAction(err))));

  @Effect()
  select$ = this.actions$
    .ofType(SponsorActions.ActionTypes.SELECT)
    .pipe(
    switchMap((action: SponsorActions.SelectAction) => this.sponsorService.loadDetail(action.payload)),
    map(result => {
      this.log.info(SponsorActions.ActionTypes.SELECT);
      return new SponsorActions.ChangedAction({
        selected: result
      });
    }));

  @Effect()
  apiError$ = this.actions$
    .ofType(SponsorActions.ActionTypes.API_ERROR)
    .pipe(
    withLatestFrom(this.store),
    map(([action, state]: [SponsorActions.ApiErrorAction, any]) => {
      //this.win.alert(action.payload);
      return new SponsorActions.ChangedAction({
        errors: [action.payload, ...(state.errors || [])]
      });
    }));

  @Effect()
  init$ = this.actions$
    .ofType(SponsorActions.ActionTypes.INIT)
    .pipe(
    startWith(new SponsorActions.InitAction()),
    map(action => new SponsorActions.FetchAction()));

  constructor(
    private store: Store<any>,
    private actions$: Actions,
    private log: LoggerService,
    private sponsorService: SponsorService,
    private win: WindowService
  ) {}
}
