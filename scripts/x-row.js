class SheetRow extends HTMLTableRowElement {
  constructor() {
    super();

    this.inputs = {};
    this.sheet = null;
  }

  onChange(key, value, oldValue) {
    console.log('Cell changed value:', key, value, oldValue);
  }

  populate({ sheet, columns, row }) {
    this.sheet = sheet;
    columns.forEach(column => {
      column.onChange = function(key, value, oldValue) {
        this.onChange(key, value, oldValue);
      };
      const $td = document.createElement('td', { is: 'x-cell' });
      this.inputs[column.key] = $td.populate({ sheet, column, value: row[column.key]});
      this.appendChild($td);
    });

    return this.inputs;
  }
}

customElements.define('x-row', SheetRow, { extends: 'tr' });