class SheetCell extends HTMLTableCellElement {
  constructor() {
    super();
    this.sheet = null;
    this.column = null;
    this.value = null;

    this.classList.add('p-0');
  }

  // Set content for the cell
  populate({ sheet, column, value }) {
    this.sheet = sheet;
    this.column = column;
    this.value = value;
    
    this.innerHTML = `
      <input type="text" value="${value}" data-key="${column.key}" class="form-control" />`;

    const $input = this.querySelector("input");

    return {
      get $el() {
        return $input;
      },
      get value() {
        return $input.value;
      },
      set value(val) {
        $input.value = val;
      }
    }
  }
}

customElements.define('x-cell', SheetCell, { extends: 'td' });
