$('document').ready(function() {
  $('#num-pages').val(PageState.get('numPages'));
  $('#threshold').val(PageState.get('threshold'));
  $('#shipping-price').val(PageState.get('shippingPrice'));

  DomInteractions.buildCategorySelector().done(function() {
    DealFinder.fetchPages(
      PageState.get('numPages'),
      PageState.get('category')
    );
  });

  $('#categories').on('change', function(event) {
    PageState.set('category', $('#categories').val());
  });

  $('#threshold').on('change', function(event) {
    PageState.set('threshold', $('#threshold').val());
  });

  $('#shipping-price').on('change', function(event) {
    PageState.set('shippingPrice', $('#shipping-price').val());
  });

  $('#num-pages').on('change', function(event) {
    PageState.set('numPages', $('#num-pages').val());
  });

  $('#deal-fetcher').on('submit', function(e) {
    e.preventDefault();
    DealFinder.fetchPages();
  });
});
