class SheetCell extends HTMLTableCellElement {
  constructor() {
    super();
  }

  // Set content for the cell
  populate(key, value) {
    console.log('Populating cell with key:', key, 'and value:', value);
    
    this.textContent = value;
  }
}

customElements.define('x-cell', SheetCell, { extends: 'td' });
