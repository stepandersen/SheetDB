function Column(model) {
  const {
    key,
    label,
    type = 'text',
    preFix = '',
    postFix = '',
    options = [],
  } = model;

  return {
    key,
    label,
    type,
    preFix,
    postFix,
    options,
    get align() {
      return type != "number" ? "left" : "right";
    }
  }
}

export { Column };