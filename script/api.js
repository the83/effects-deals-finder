var API = {
  EFFECTS_PATH: 'https://reverb.com/api/categories/effects-and-pedals',
  PRICE_GUIDE_PATH: 'https://reverb.com/api/priceguide',
  CATEGORIES_PATH: 'https://reverb.com/api/categories',

  fetchCategories: function() {
    return $.ajax({ type: 'GET', url: API.CATEGORIES_PATH });
  },

  fetchListings: function(page, category) {
    return $.ajax({
      url: API.CATEGORIES_PATH + '/' + category,
      data: { page: page }
    });
  },

  fetchPricing: function(query) {
    return $.ajax({
      url: API.PRICE_GUIDE_PATH,
      data: { query: query }
    });
  }
};
