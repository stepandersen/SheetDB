class SheetRow extends HTMLTableRowElement {
  constructor() {
    super();
  }

  populate(headers, rowData) {
    headers.forEach(key => {
      const cell = document.createElement('td', { is: 'x-cell' });
      cell.populate(key.key, rowData[key.key]);
      this.appendChild(cell);
    });

  }
}

customElements.define('x-row', SheetRow, { extends: 'tr' });