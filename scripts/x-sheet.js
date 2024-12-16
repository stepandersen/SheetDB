import { Column } from '/scripts/Column.js';

class SheetTable extends HTMLTableElement {
  constructor() {
    super(); // Call the parent constructor

    this.rowRefs = [];
    this.thead = this.createTHead();
    this.tbody = this.createTBody();
    this.tfoot = this.createTFoot();
    // const caption = this.createCaption();
    // caption.textContent = "Custom Table Caption";
    this.classList.add('table', 'p-0');
  }

  // Connected lifecycle callback
  connectedCallback() {
    console.log('CustomTable connected to the DOM.');
  }

  // Disconnected lifecycle callback
  disconnectedCallback() {
    console.log('CustomTable removed from the DOM.');
  }

  changedRow(row, key) {
    console.log('Changed row:', row, key);
  }

  populate({ sheet, columns, rows }) {

    const _columns = columns.map(column => new Column(column));
    
    const $tr = document.createElement('tr');

    if (_columns.length > 0) {
      _columns.forEach(column => {
        const $th = document.createElement('th');
        $th.classList.add('px-3', 'py-2');
        $th.textContent = column.label;
        $tr.appendChild($th);
      });
      this.thead.appendChild($tr);

      rows.forEach(row => {
        const $tr = document.createElement('tr', { is: 'x-row' });
        this.rowRefs.push($tr.populate({ sheet, columns: _columns, row }));
        this.tbody.appendChild($tr);
      });
    }

    return this.rowRefs;
  }
}

// Define the custom element with is="x-sheet"
customElements.define('x-sheet', SheetTable, { extends: 'table' });
