class SheetTable extends HTMLTableElement {
  constructor() {
    super(); // Call the parent constructor

    this.thead = this.createTHead();
    this.tbody = this.createTBody();
    this.tfoot = this.createTFoot();
    const caption = this.createCaption();
    caption.textContent = "Custom Table Caption";
    this.classList.add('table');
  }

  // Connected lifecycle callback
  connectedCallback() {
    console.log('CustomTable connected to the DOM.');
  }

  // Disconnected lifecycle callback
  disconnectedCallback() {
    console.log('CustomTable removed from the DOM.');
  }

  // Example: Add a method to populate rows
  populate(data) {
    const { headers, body } = data;

    const headRow = document.createElement('tr');

    if (headers.length > 0) {
      headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header.label;
        headRow.appendChild(th);
      });
      this.thead.appendChild(headRow);

      body.forEach(rowData => {
        const row = document.createElement('tr', { is: 'x-row' });
        row.populate(headers, rowData);
        this.tbody.appendChild(row);
      });
    }
  }
}

// Define the custom element with is="x-sheet"
customElements.define('x-sheet', SheetTable, { extends: 'table' });
