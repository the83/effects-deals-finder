var API = {
  EFFECTS_PATH: 'https://reverb.com/api/categories/effects-and-pedals',
  PRICE_GUIDE_PATH: 'https://reverb.com/api/priceguide',

  fetchListing: function(page) {
    return $.ajax({
      url: API.EFFECTS_PATH,
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

var DomInteractions = {
  setLoading: function(isLoading) {
    if (isLoading) {
      $('.loader').removeClass('hidden');
    } else {
      $('.loader').addClass('hidden');
    }
  },

  renderDeal: function(listing, estimatedValue) {
    console.log(estimatedValue);
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

var DealFinder = {
  listings: [],
  threshold: 10,
  shippingPrice: 10,
  numPages: 1,

  fetchPages: function(numPages) {
    var timeout = 0;

    for (var page = 1; page <= numPages; page++) {
      DealFinder._fetchListings(page, timeout); timeout += 2000;
    }

    return false;
  },

  _fetchAllPricing: function(response) {
    var timeout = 0, requests = [];

    for (var i = 0; i < response.listings.length; i++) {
      requests.push(DealFinder._calculateDeal(response.listings[i], timeout += 200));
    }

    return Q.all(requests).finally(function() {
      DomInteractions.setLoading(false);
    });
  },

  _fetchListings: function(page, timeout) {
    page = page || 1; timeout = timeout || 0;
    DomInteractions.setLoading(true);

    Q.delay(timeout).then(function() {
      API.fetchListing(page).done(DealFinder._fetchAllPricing);
    });
  },

  _buildQuery: function(listing) {
    return listing.make + ' ' + listing.model + ' ' + listing.year + ' ' + listing.finish;
  },

  _calculateDeal: function(listing, timeout) {
    if (DealFinder._alreadyFlagged(listing)) { return; }

    return Q.delay(timeout).then(function() {
      var request = API.fetchPricing(DealFinder._buildQuery(listing));

      request.done(function(pricing) {
        if (!pricing.price_guides.length) { return; }
        var estimatedValue = pricing.price_guides[0].estimated_value;

        if (DealFinder._goodDeal(listing, estimatedValue)) {
          DealFinder.listings.push(listing);
          DomInteractions.renderDeal(listing, estimatedValue);
        }
      });

      return request;
    });
  },

  _goodDeal: function(listing, estimatedValue) {
    var comparisonPrice = estimatedValue.bottom_price + this.threshold + this.shippingPrice;
    var listingPrice = parseInt(listing.price.amount) + this.shippingPrice;
    return comparisonPrice >= listingPrice;
  },

  _alreadyFlagged: function(listing) {
    return _.findWhere(this.listings, { id: listing.id });
  }
};

$('document').ready(function() {
  $('#num-pages').val(DealFinder.numPages);
  DealFinder.fetchPages(DealFinder.numPages);

  $('#deal-fetcher').on('submit', function(e) {
    e.preventDefault();
    numPages = $('#num-pages').val();
    DealFinder.fetchPages(numPages);
  });
});
