'use strict'; // necessary for es6 output in node

import { browser, element, by, ElementFinder, ElementArrayFinder } from 'protractor';
import { promise } from 'selenium-webdriver';

const expectedH1 = 'Clientes';
const expectedTitle = `${expectedH1}`;
const targetCliente = { id: 15, nome: 'Magneta' };
const targetClientehomeIndex = 3;
const nomeSuffix = 'X';
const newClientenome = targetCliente.nome + nomeSuffix;

class Cliente {
  id: number;
  nome: string;

  // Factory methods

  // Cliente from string formatted as '<id> <nome>'.
  static fromString(s: string): Cliente {
    return {
      id: +s.substr(0, s.indexOf(' ')),
      nome: s.substr(s.indexOf(' ') + 1),
    };
  }

  // Cliente from Cliente list <li> element.
  static async fromLi(li: ElementFinder): Promise<Cliente> {
      let stringsFromA = await li.all(by.css('a')).getText();
      let strings = stringsFromA[0].split(' ');
      return { id: +strings[0], nome: strings[1] };
  }

  // Cliente id and nome from the given detail element.
  static async fromDetail(detail: ElementFinder): Promise<Cliente> {
    // Get Cliente id from the first <div>
    let _id = await detail.all(by.css('div')).first().getText();
    // Get nome from the h2
    let _nome = await detail.element(by.css('h2')).getText();
    return {
        id: +_id.substr(_id.indexOf(' ') + 1),
        nome: _nome.substr(0, _nome.lastIndexOf(' '))
    };
  }
}

describe('Tutorial part 6', () => {

  beforeAll(() => browser.get(''));

  function getPageElts() {
    let navElts = element.all(by.css('app-root nav a'));

    return {
      navElts: navElts,

      apphomeHref: navElts.get(0),
      apphome: element(by.css('app-root app-home')),
      topClientes: element.all(by.css('app-root app-home > div h4')),

      appClientesHref: navElts.get(1),
      appClientes: element(by.css('app-root app-Clientes')),
      allClientes: element.all(by.css('app-root app-Clientes li')),
      selectedClienteSubview: element(by.css('app-root app-Clientes > div:last-child')),

      ClienteDetail: element(by.css('app-root app-Cliente-detail > div')),

      searchBox: element(by.css('#search-box')),
      searchResults: element.all(by.css('.search-result li'))
    };
  }

  describe('Initial page', () => {

    it(`has title '${expectedTitle}'`, () => {
      expect(browser.getTitle()).toEqual(expectedTitle);
    });

    it(`has h1 '${expectedH1}'`, () => {
        expectHeading(1, expectedH1);
    });

    const expectedViewnomes = ['home', 'Clientes'];
    it(`has views ${expectedViewnomes}`, () => {
      let viewnomes = getPageElts().navElts.map((el: ElementFinder) => el.getText());
      expect(viewnomes).toEqual(expectedViewnomes);
    });

    it('has home as the active view', () => {
      let page = getPageElts();
      expect(page.apphome.isPresent()).toBeTruthy();
    });

  });

  describe('home tests', () => {

    beforeAll(() => browser.get(''));

    it('has top Clientes', () => {
      let page = getPageElts();
      expect(page.topClientes.count()).toEqual(4);
    });

    it(`selects and routes to ${targetCliente.nome} details`, homeSelectTargetCliente);

    it(`updates Cliente nome (${newClientenome}) in details view`, updateClientenomeInDetailView);

    it(`cancels and shows ${targetCliente.nome} in home`, () => {
      element(by.buttonText('go back')).click();
      browser.waitForAngular(); // seems necessary to gets tests to pass for toh-pt6

      let targetClientelt = getPageElts().topClientes.get(targetClientehomeIndex);
      expect(targetClientelt.getText()).toEqual(targetCliente.nome);
    });

    it(`selects and routes to ${targetCliente.nome} details`, homeSelectTargetCliente);

    it(`updates Cliente nome (${newClientenome}) in details view`, updateClientenomeInDetailView);

    it(`saves and shows ${newClientenome} in home`, () => {
      element(by.buttonText('save')).click();
      browser.waitForAngular(); // seems necessary to gets tests to pass for toh-pt6

      let targetClientelt = getPageElts().topClientes.get(targetClientehomeIndex);
      expect(targetClientelt.getText()).toEqual(newClientenome);
    });

  });

  describe('Clientes tests', () => {

    beforeAll(() => browser.get(''));

    it('can switch to Clientes view', () => {
      getPageElts().appClientesHref.click();
      let page = getPageElts();
      expect(page.appClientes.isPresent()).toBeTruthy();
      expect(page.allClientes.count()).toEqual(10, 'number of Clientes');
    });

    it('can route to Cliente details', async () => {
      getClienteLiEltById(targetCliente.id).click();

      let page = getPageElts();
      expect(page.ClienteDetail.isPresent()).toBeTruthy('shows Cliente detail');
      let Cliente = await Cliente.fromDetail(page.ClienteDetail);
      expect(Cliente.id).toEqual(targetCliente.id);
      expect(Cliente.nome).toEqual(targetCliente.nome.toUpperCase());
    });

    it(`updates Cliente nome (${newClientenome}) in details view`, updateClientenomeInDetailView);

    it(`shows ${newClientenome} in Clientes list`, () => {
      element(by.buttonText('save')).click();
      browser.waitForAngular();
      let expectedText = `${targetCliente.id} ${newClientenome}`;
      expect(getClienteAEltById(targetCliente.id).getText()).toEqual(expectedText);
    });

    it(`deletes ${newClientenome} from Clientes list`, async () => {
      const ClientesBefore = await toClienteArray(getPageElts().allClientes);
      const li = getClienteLiEltById(targetCliente.id);
      li.element(by.buttonText('x')).click();

      const page = getPageElts();
      expect(page.appClientes.isPresent()).toBeTruthy();
      expect(page.allClientes.count()).toEqual(9, 'number of Clientes');
      const ClientesAfter = await toClienteArray(page.allClientes);
      // console.log(await Cliente.fromLi(page.allClientes[0]));
      const expectedClientes =  ClientesBefore.filter(h => h.nome !== newClientenome);
      expect(ClientesAfter).toEqual(expectedClientes);
      // expect(page.selectedClienteSubview.isPresent()).toBeFalsy();
    });

    it(`adds back ${targetCliente.nome}`, async () => {
      const newClientenome = 'Alice';
      const ClientesBefore = await toClienteArray(getPageElts().allClientes);
      const numClientes = ClientesBefore.length;

      element(by.css('input')).sendKeys(newClientenome);
      element(by.buttonText('add')).click();

      let page = getPageElts();
      let ClientesAfter = await toClienteArray(page.allClientes);
      expect(ClientesAfter.length).toEqual(numClientes + 1, 'number of Clientes');

      expect(ClientesAfter.slice(0, numClientes)).toEqual(ClientesBefore, 'Old Clientes are still there');

      const maxId = ClientesBefore[ClientesBefore.length - 1].id;
      expect(ClientesAfter[numClientes]).toEqual({id: maxId + 1, nome: newClientenome});
    });

    it('displays correctly styled buttons', async () => {
      element.all(by.buttonText('x')).then(buttons => {
        for (const button of buttons) {
          // Inherited styles from styles.css
          expect(button.getCssValue('font-family')).toBe('Arial');
          expect(button.getCssValue('border')).toContain('none');
          expect(button.getCssValue('padding')).toBe('5px 10px');
          expect(button.getCssValue('border-radius')).toBe('4px');
          // Styles defined in Clientes.component.css
          expect(button.getCssValue('left')).toBe('194px');
          expect(button.getCssValue('top')).toBe('-32px');
        }
      });

      const addButton = element(by.buttonText('add'));
      // Inherited styles from styles.css
      expect(addButton.getCssValue('font-family')).toBe('Arial');
      expect(addButton.getCssValue('border')).toContain('none');
      expect(addButton.getCssValue('padding')).toBe('5px 10px');
      expect(addButton.getCssValue('border-radius')).toBe('4px');
    });

  });

  describe('Progressive Cliente search', () => {

    beforeAll(() => browser.get(''));

    it(`searches for 'Ma'`, async () => {
      getPageElts().searchBox.sendKeys('Ma');
      browser.sleep(1000);

      expect(getPageElts().searchResults.count()).toBe(4);
    });

    it(`continues search with 'g'`, async () => {
      getPageElts().searchBox.sendKeys('g');
      browser.sleep(1000);
      expect(getPageElts().searchResults.count()).toBe(2);
    });

    it(`continues search with 'e' and gets ${targetCliente.nome}`, async () => {
      getPageElts().searchBox.sendKeys('n');
      browser.sleep(1000);
      let page = getPageElts();
      expect(page.searchResults.count()).toBe(1);
      let Cliente = page.searchResults.get(0);
      expect(Cliente.getText()).toEqual(targetCliente.nome);
    });

    it(`navigates to ${targetCliente.nome} details view`, async () => {
      let Cliente = getPageElts().searchResults.get(0);
      expect(Cliente.getText()).toEqual(targetCliente.nome);
      Cliente.click();

      let page = getPageElts();
      expect(page.ClienteDetail.isPresent()).toBeTruthy('shows Cliente detail');
      let Cliente2 = await Cliente.fromDetail(page.ClienteDetail);
      expect(Cliente2.id).toEqual(targetCliente.id);
      expect(Cliente2.nome).toEqual(targetCliente.nome.toUpperCase());
    });
  });

  async function homeSelectTargetCliente() {
    let targetClientelt = getPageElts().topClientes.get(targetClientehomeIndex);
    expect(targetClientelt.getText()).toEqual(targetCliente.nome);
    targetClientelt.click();
    browser.waitForAngular(); // seems necessary to gets tests to pass for toh-pt6

    let page = getPageElts();
    expect(page.ClienteDetail.isPresent()).toBeTruthy('shows Cliente detail');
    let Cliente = await Cliente.fromDetail(page.ClienteDetail);
    expect(Cliente.id).toEqual(targetCliente.id);
    expect(Cliente.nome).toEqual(targetCliente.nome.toUpperCase());
  }

  async function updateClientenomeInDetailView() {
    // Assumes that the current view is the Cliente details view.
    addToClientenome(nomeSuffix);

    let page = getPageElts();
    let Cliente = await Cliente.fromDetail(page.ClienteDetail);
    expect(Cliente.id).toEqual(targetCliente.id);
    expect(Cliente.nome).toEqual(newClientenome.toUpperCase());
  }

});

function addToClientenome(text: string): promise.Promise<void> {
  let input = element(by.css('input'));
  return input.sendKeys(text);
}

function expectHeading(hLevel: number, expectedText: string): void {
    let hTag = `h${hLevel}`;
    let hText = element(by.css(hTag)).getText();
    expect(hText).toEqual(expectedText, hTag);
};

function getClienteAEltById(id: number): ElementFinder {
  let spanForId = element(by.cssContainingText('li span.badge', id.toString()));
  return spanForId.element(by.xpath('..'));
}

function getClienteLiEltById(id: number): ElementFinder {
  let spanForId = element(by.cssContainingText('li span.badge', id.toString()));
  return spanForId.element(by.xpath('../..'));
}

async function toClienteArray(allClientes: ElementArrayFinder): Promise<Cliente[]> {
  let promisedClientes = await allClientes.map(Cliente.fromLi);
  // The cast is necessary to get around issuing with the signature of Promise.all()
  return <Promise<any>> Promise.all(promisedClientes);
}
