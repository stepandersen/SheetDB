function createSpan(text) {
  const span = document.createElement('span');
  span.className = 'input-group-text';
  span.textContent = text;
  return span;
}

function createInput(key, value, type, align) {
  const input = document.createElement('input');
  input.type = type;
  input.value = value || '';
  input.dataset.key = key;
  input.className = `form-control ${align == 'right' ? 'text-end' : ''}`;
  return input;
}

function createToggle(key, value) {
  const input = document.createElement('input');
  input.type = type;
  input.value = value || '';
  input.dataset.key = key;
  input.className = `form-control ${align == 'right' ? 'text-end' : ''}`;
  return input;
}

function createSelect(key, selectedValue, options = [], align) {
  const select = document.createElement('select');
  select.dataset.key = key;
  select.className = `form-control ${align == 'right' ? 'text-end' : ''}`;
  options.forEach(option => {
    const opt = document.createElement('option');
    opt.value = option;
    opt.textContent = option;
    if (selectedValue === option) {
      opt.selected = true;
    }
    select.appendChild(opt);
  });
  return select;
}

function createCustomComponent(componentName, props) {
  const customElement = document.createElement(componentName);
  Object.keys(props).forEach(prop => {
    customElement.setAttribute(prop, props[prop]); // Pass props as attributes
  });
  return customElement;
}

function createFormControl({ preFix, postFix, type, key, align, options, customComponent }, value) {
  const wrapper = document.createElement('div');
  wrapper.className = 'input-group';

  // Add prefix if applicable
  if (preFix) {
    wrapper.appendChild(createSpan(preFix));
  }

  // Add main input, select, or custom component
  let mainElement;
  if (customComponent) {
    mainElement = createCustomComponent(customComponent, { key, value });
  } else if (type === 'select') {
    mainElement = createSelect(key, value, options, align);
  } else {
    mainElement = createInput(key, value, type, align);
  }
  wrapper.appendChild(mainElement);

  // Add postfix if applicable
  if (postFix) {
    wrapper.appendChild(createSpan(postFix));
  }

  return wrapper;
}

export {
  createFormControl
};