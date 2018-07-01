import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { Cliente } from './../cliente';
import { ClienteService }  from '../Cliente.service';

@Component({
  selector: 'app-Cliente-detail',
  templateUrl: './Cliente-detail.component.html',
  styleUrls: [ './Cliente-detail.component.css' ]
})
export class ClienteDetailComponent implements OnInit {
  @Input() Cliente: Cliente;

  constructor(
    private route: ActivatedRoute,
    private ClienteService: ClienteService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.getCliente();
  }

  getCliente(): void {
    const id = +this.route.snapshot.paramMap.get('id');
    this.ClienteService.getCliente(id)
      .subscribe(Cliente => this.Cliente = Cliente);
  }

  goBack(): void {
    this.location.back();
  }

 save(): void {
    this.ClienteService.updateCliente(this.Cliente)
      .subscribe(() => this.goBack());
  }
}
