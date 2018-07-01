import { Component, OnInit } from '@angular/core';

import { Observable, Subject } from 'rxjs';

import {
   debounceTime, distinctUntilChanged, switchMap
 } from 'rxjs/operators';

import { Cliente } from '../Cliente';
import { ClienteService } from '../Cliente.service';

@Component({
  selector: 'app-Cliente-search',
  templateUrl: './Cliente-search.component.html',
  styleUrls: [ './Cliente-search.component.css' ]
})
export class ClienteSearchComponent implements OnInit {
  Clientes$: Observable<Cliente[]>;
  private searchTerms = new Subject<string>();

  constructor(private ClienteService: ClienteService) {}

  // Push a search term into the observable stream.
  search(term: string): void {
    this.searchTerms.next(term);
  }

  ngOnInit(): void {
    this.Clientes$ = this.searchTerms.pipe(
      // wait 300ms after each keystroke before considering the term
      debounceTime(300),

      // ignore new term if same as previous term
      distinctUntilChanged(),

      // switch to new search observable each time the term changes
      switchMap((term: string) => this.ClienteService.searchClientes(term)),
    );
  }
}
