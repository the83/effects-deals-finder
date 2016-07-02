var EFFECTS_PATH = 'https://reverb.com/api/categories/effects-and-pedals';
var PRICE_GUIDE_PATH = 'https://reverb.com/api/priceguide';
var listings = [];
shippingPrice = 10;
threshold = 10;

function setLoading() {
  $('.loader').removeClass('hidden');
}

function endLoading() {
  $('.loader').addClass('hidden');
}

function fetchListings(page, timeout) {
  page = page || 1;
  timeout = timeout || 0;

  Q.delay(timeout).then(function() {
    setLoading();
    return $.ajax({
      url: EFFECTS_PATH,
      data: {
        page: page
      }
    }).done(function(response) {
      var pricingTimeout = 0;
      var pricingRequests = [];
      for (var i = 0; i < response.listings.length; i++) {
        pricingRequests.push(
          fetchPricing(response.listings[i], pricingTimeout += 200)
        );
      }
      return Q.all(pricingRequests).finally(function() {
        endLoading();
      });
    });
  });
}

function buildQuery(listing) {
  return listing.make + ' ' + listing.model + ' ' + listing.year;
}

function fetchPricing(listing, timeout) {
  if (alreadyFlagged(listing)) {
    return;
  }

  return Q.delay(timeout).then(function() {
    var request = $.ajax({
      url: PRICE_GUIDE_PATH,
      data: {
        query: buildQuery(listing)
      }
    });

    request.done(function(pricing) {
      if (!pricing.price_guides.length) { return; }
      if (goodDeal(listing, pricing.price_guides[0])) {
        listings.push(listing);
        renderDeal(listing);
      }
    });

    return request;
  });
}

function goodDeal(listing, priceGuide) {
  return (priceGuide.estimated_value.bottom_price + threshold + shippingPrice) >= (listing.price.amount + shippingPrice);
}

function alreadyFlagged(listing) {
  return _.findWhere(listings, { id: listing.id });
}

function getFirstTwentyPages() {
  var timeout = 0;
  for (var page = 1; page <= 20; page++) {
    timeout += 2000;
    fetchListings(page, timeout);
  }
}

function renderDeal(listing) {
  $('#deals').append(
    '<div class="card">' +
      '<div class="card-header">' +
        '<a href="' + listing._links.web.href + '">'  +
          listing.title +
        '</a>' +
      '</div>' +
      '<img class="card-image" src="' + listing.photos[0]._links.thumbnail.href + '" />' +
      '<div class="card-footer">' +
        '<span class="condition">' + listing.condition + '</span>' +
        '<span class="pricing">' + listing.price.display + '/' + listing.shipping.us_rate.display + '</span>' +
      '</div>' +
    '</div>'
  );
}

$('document').ready(function() {
  // getFirstTwentyPages();

  $('#fetch-more').on('click', function() {
    getFirstTwentyPages();
  });
});
