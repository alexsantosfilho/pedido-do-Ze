import { Component, OnInit } from '@angular/core';

import { Cliente } from '../Cliente';
import { ClienteService } from '../Cliente.service';

@Component({
  selector: 'app-Clientes',
  templateUrl: './Clientes.component.html',
  styleUrls: ['./Clientes.component.css']
})
export class ClientesComponent implements OnInit {
  Clientes: Cliente[];

  constructor(private ClienteService: ClienteService) { }

  ngOnInit() {
    this.getClientes();
  }

  getClientes(): void {
    this.ClienteService.getClientes()
    .subscribe(Clientes => this.Clientes = Clientes);
  }

  add(nome: string): void {
    nome = nome.trim();
    if (!nome) { return; }
    this.ClienteService.addCliente({ nome } as Cliente)
      .subscribe(Cliente => {
        this.Clientes.push(Cliente);
      });
  }

  delete(Cliente: Cliente): void {
    this.Clientes = this.Clientes.filter(h => h !== Cliente);
    this.ClienteService.deleteCliente(Cliente).subscribe();
  }

}
