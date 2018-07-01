import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Cliente } from './Cliente';
import { MessageService } from './message.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({ providedIn: 'root' })
export class ClienteService {

  private ClientesUrl = 'api/Clientes';  // URL to web api

  constructor(
    private http: HttpClient,
    private messageService: MessageService) { }

  /** GET Clientes from the server */
  getClientes (): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.ClientesUrl)
      .pipe(
        tap(Clientes => this.log(`fetched Clientes`)),
        catchError(this.handleError('getClientes', []))
      );
  }

  /** GET Cliente by id. Return `undefined` when id not found */
  getClienteNo404<Data>(id: number): Observable<Cliente> {
    const url = `${this.ClientesUrl}/?id=${id}`;
    return this.http.get<Cliente[]>(url)
      .pipe(
        map(Clientes => Clientes[0]), // returns a {0|1} element array
        tap(h => {
          const outcome = h ? `fetched` : `did not find`;
          this.log(`${outcome} Cliente id=${id}`);
        }),
        catchError(this.handleError<Cliente>(`getCliente id=${id}`))
      );
  }

  /** GET Cliente by id. Will 404 if id not found */
  getCliente(id: number): Observable<Cliente> {
    const url = `${this.ClientesUrl}/${id}`;
    return this.http.get<Cliente>(url).pipe(
      tap(_ => this.log(`fetched Cliente id=${id}`)),
      catchError(this.handleError<Cliente>(`getCliente id=${id}`))
    );
  }

  /* GET Clientes whose nome contains search term */
  searchClientes(term: string): Observable<Cliente[]> {
    if (!term.trim()) {
      // if not search term, return empty Cliente array.
      return of([]);
    }
    return this.http.get<Cliente[]>(`${this.ClientesUrl}/?nome=${term}`).pipe(
      tap(_ => this.log(`found Clientes matching "${term}"`)),
      catchError(this.handleError<Cliente[]>('searchClientes', []))
    );
  }

  //////// Save methods //////////

  /** POST: add a new Cliente to the server */
  addCliente (Cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(this.ClientesUrl, Cliente, httpOptions).pipe(
      tap((Cliente: Cliente) => this.log(`added Cliente w/ id=${Cliente.id}`)),
      catchError(this.handleError<Cliente>('addCliente'))
    );
  }

  /** DELETE: delete the Cliente from the server */
  deleteCliente (Cliente: Cliente | number): Observable<Cliente> {
    const id = typeof Cliente === 'number' ? Cliente : Cliente.id;
    const url = `${this.ClientesUrl}/${id}`;

    return this.http.delete<Cliente>(url, httpOptions).pipe(
      tap(_ => this.log(`deleted Cliente id=${id}`)),
      catchError(this.handleError<Cliente>('deleteCliente'))
    );
  }

  /** PUT: update the Cliente on the server */
  updateCliente (Cliente: Cliente): Observable<any> {
    return this.http.put(this.ClientesUrl, Cliente, httpOptions).pipe(
      tap(_ => this.log(`updated Cliente id=${Cliente.id}`)),
      catchError(this.handleError<any>('updateCliente'))
    );
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - nome of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  /** Log a ClienteService message with the MessageService */
  private log(message: string) {
    this.messageService.add('ClienteService: ' + message);
  }
}
