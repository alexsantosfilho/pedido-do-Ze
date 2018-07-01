import { Component, OnInit } from '@angular/core';
import { Cliente } from '../Cliente';
import { ClienteService } from '../Cliente.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: [ './home.component.css' ]
})
export class homeComponent implements OnInit {
  Clientes: Cliente[] = [];

  constructor(private ClienteService: ClienteService) { }

  ngOnInit() {
    this.getClientes();
  }

  getClientes(): void {
    this.ClienteService.getClientes()
      .subscribe(Clientes => this.Clientes = Clientes.slice(1, 5));
  }
}
