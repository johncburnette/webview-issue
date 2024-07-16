const isEqual = (a = null, b = null) => {
  const ok = Object.keys,
    ta = typeof a,
    tb = typeof b;
  return a && b && ta === 'object' && ta === tb
    ? ok(a).length === ok(b).length &&
        ok(a).every(key => isEqual(a[key], b[key]))
    : a === b;
};

export { isEqual };
