import { InMemoryDbService } from 'angular-in-memory-web-api';

export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    const Clientes = [
      { id: 1, nome: 'Miguel', sabores: 'cereja, limão, orgânico, com açúcar' },
      { id: 2, nome: 'Davi', sabores: 'cereja, limão, sem açúcar' },
      { id: 3, nome: 'Arthur', sabores: 'cereja, limão, vegano com açúcar' },
      { id: 4, nome: 'Pedro', sabores: 'limão, orgânico, vegano sem açúcar' },
      { id: 5, nome: 'Gabriel', sabores: 'cereja, limão, vegano com açúcar' },
    ];
    return {Clientes};
  }
}
