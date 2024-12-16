import { createFormControl } from "/scripts/DOM.js"

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

    const template = createFormControl(column, value);

    this.appendChild(template);

    const $input = this.querySelector("input, select, textarea");

    // if($input)
    //   $input.addEventListener('change', (e) => {
    //     this.column.onChange(column.key, e.target.value, this.value);
    //     this.value = e.target.value;
    //   });

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
