import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { homeComponent }   from './home/home.component';
import { ClientesComponent }      from './Clientes/Clientes.component';
import { ClienteDetailComponent }  from './Cliente-detail/Cliente-detail.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: homeComponent },
  { path: 'detail/:id', component: ClienteDetailComponent },
  { path: 'Clientes', component: ClientesComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
