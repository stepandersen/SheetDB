import { getSharedSheet } from '/scripts/shareable.js';

class SheetList extends HTMLElement {
  constructor() {
    super();
    this.container = document.createElement('div');

    this.sheets = [];
    
    getSharedSheet('sheets', (data) => {
      this.sheets = data;
      this.render();
    });
  }

  // Lifecycle method: Called when the element is added to the DOM
  connectedCallback() {
    console.log(`${this.tagName} added to the DOM`);
    //this.render();
  }

  // Lifecycle method: Called when the element is removed from the DOM
  disconnectedCallback() {
    console.log(`${this.tagName} removed from the DOM`);
  }

  // Observe changes to specific attributes
  static get observedAttributes() {
    return ['data-value']; // Add attributes you want to observe
  }

  // Lifecycle method: Called when an observed attribute changes
  attributeChangedCallback(name, oldValue, newValue) {
    console.log(`Attribute "${name}" changed from "${oldValue}" to "${newValue}"`);
    this.render();
  }

  // Render logic (update DOM directly within the component)
  render() {
    this.container.innerHTML = `
      <h1>Sheet List(${this.sheets.length})</h1>
      <ul>
        ${this.sheets.map(sheet => `<li><a href="/sheet/?id=${sheet.id}">${sheet.name}</a></li>`).join('')}
      </ul>
    `;
    this.appendChild(this.container);
  }
}

// Define and register the custom element
customElements.define('sheet-list', SheetList);
