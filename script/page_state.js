var PageState = {
  _defaults: {
    threshold: localStorage.getItem('threshold') || 10,
    shippingPrice: localStorage.getItem('shippingPrice') || 10,
    numPages: localStorage.getItem('numPages') || 20,
    category: localStorage.getItem('category') || 'effects-and-pedals',
  },
  set: function(key, value) {
    localStorage.setItem(key, value);
  },
  get: function(key) {
    return localStorage.getItem(key) || this._defaults[key];
  }
};
