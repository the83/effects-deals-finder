var DomInteractions = {
  setLoading: function(isLoading) {
    if (isLoading) {
      $('.loader').removeClass('hidden');
    } else {
      $('.loader').addClass('hidden');
    }
  },

  buildCategorySelector: function() {
    var request = API.fetchCategories();
    request.done(function(response) {
      for (var i=0; i < response.categories.length; i++) {
        DomInteractions._addCategory(response.categories[i]);
      }
      DomInteractions.setCategory(PageState.get('category'));
    });

    return request;
  },

  _addCategory: function(category) {
    $('#categories').append($("<option></option>").attr("value", category.slug).text(category.name));
  },

  setCategory: function(category) {
    $('#categories').val(category);
  },

  renderDeal: function(listing, estimatedValue) {
    $('#deals').append(
      '<div class="card">' +
        '<a href="' + listing._links.web.href + '">'  +
        '<div class="card-header">' +
            listing.title +
        '</div>' +
        '<img class="card-image" src="' + listing.photos[0]._links.thumbnail.href + '" />' +
        '<div class="card-footer">' +
          '<div>' +
            '<span class="condition">' + listing.condition + ': </span>' +
            '<span class="pricing">' +
              listing.price.display + '/' + listing.shipping.us_rate.display +
            '</span>' +
          '</div>' +
          '<div>' +
            '<span class="estimated-pricing">' +
              'guide: ' + estimatedValue.price_low.display + '-' + estimatedValue.price_high.display +
            '</span>' +
          '</div>' +
        '</div>' +
      '</a>' +
      '</div>'
    );
  }
};
