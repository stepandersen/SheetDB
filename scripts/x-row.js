class SheetRow extends HTMLTableRowElement {
  constructor() {
    super();

    this.inputs = {};
  }

  populate({ sheet, columns, row }) {
    columns.forEach(column => {
      const $td = document.createElement('td', { is: 'x-cell' });
      this.inputs[column.key] = $td.populate({ sheet, column, value: row[column.key]});
      this.appendChild($td);
    });

    return this.inputs;
  }
}

customElements.define('x-row', SheetRow, { extends: 'tr' });