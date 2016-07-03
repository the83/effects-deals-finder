var DealFinder = {
  listings: [],

  fetchPages: function() {
    var timeout = 0;

    for (var page = 1; page <= PageState.get('numPages'); page++) {
      DealFinder._fetchListings(page, PageState.get('category'), timeout); timeout += 2000;
    }

    return false;
  },

  _fetchAllPricing: function(response) {
    DomInteractions.setLoading(true);
    var timeout = 0, requests = [];

    for (var i = 0; i < response.listings.length; i++) {
      requests.push(DealFinder._calculateDeal(response.listings[i], timeout += 200));
    }

    return Q.all(requests).finally(function() {
      DomInteractions.setLoading(false);
    });
  },

  _fetchListings: function(page, category, timeout) {
    page = page || 1; timeout = timeout || 0;
    DomInteractions.setLoading(true);

    Q.delay(timeout).then(function() {
      API.fetchListings(page, category).done(DealFinder._fetchAllPricing);
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
    var comparisonPrice = estimatedValue.bottom_price + parseInt(PageState.get('threshold')) + parseInt(PageState.get('shippingPrice'));
    var listingPrice = parseInt(listing.price.amount) + parseInt(listing.shipping.us_rate.amount);
    return comparisonPrice >= listingPrice;
  },

  _alreadyFlagged: function(listing) {
    return _.findWhere(this.listings, { id: listing.id });
  }
};
