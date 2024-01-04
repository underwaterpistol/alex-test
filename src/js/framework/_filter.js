/**
 * This file handles logic relating to collection filters.
 * You need to set up storefront filters in Online Store > Navigation.
 * NOTE: You cannot use both storefront filtering and tag filtering at the same time.
 */

import { getParamsFromForm, objectToQueryString, reloadScripts, removeEmptyKeys } from './utils.js';
const ThemeVars = window.ThemeVars;

const Filter = {

  config: {
    gridSection: 'products_grid', // Name of the section that will be fetched using the section rendering API
    productsGridQuery: '.collection__products-grid', // Query of the products grid inside the collection page that will be replaced
    paginateItemsQuery: '[data-paginate-items]', // Query of the hidden element that renders the paginate.items in the frontend
    productsCountQuery: '[data-products-count]', // Query of the HTML elements that will show the products count
    filterGroupQuery: '.filter-group',
    activeFilterCountQuery: '[data-active-filters-count]'
  },

  state: {
    filters: {},
    sortBy: false,
    page: false,
    productsCount: 0
  },

  /**
   * Initializes the filter object.
   *  - Will automatically apply filters from the URL.
   *  - Emits an event when init is complete.
   */
  init: function() {
    const existingFilters = this.getFiltersFromUrl();
    this.state.sortBy = this.getSortBy();
    this.state.page = this.getPage();
    this.updateProductsCount();
    if (Object.keys(existingFilters).length > 0) {
      this.state.filters = existingFilters;
      this.applyFilters();
    }
    document.dispatchEvent(new CustomEvent('filtersReady'));
  },

  /**
   * Returns the filters from the URL as an object.
   * @returns {Object} The filters from the URL.
   */
  getFiltersFromUrl: function() {
    const urlParams = new URLSearchParams(window.location.search);
    const filters = {};
    for (let [key, value] of urlParams) {
      if (key.startsWith('filter')) {
        filters[key] = value;
      }
    }
    return filters;
  },

  /**
   * Check if the url has sort_by parameters
   * @returns {boolean} - Whether or not sorting parameters are set.
   */
  getSortBy: function() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('sort_by') || false;
  },

  /**
   * Check if the url has page parameters
   * @returns {Boolean} - Whether or not the page parameter is set.
   */
  getPage: function() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('page') || false;
  },

  /**
   * Handles a submission of a filter form.
   * @param {Event} event The submit event
   *  - Prevent default behavior
   *  - Converts the filter inputs to an object
   *  - Applies the filters
   */
  handleSubmit: function(event) {
    event.preventDefault();
    const form = event.target;
    this.state.filters = removeEmptyKeys(getParamsFromForm(form));

    /*
     * The pagination page needs to be reset when changing filters
     * as the pagination changes depending on the selected filters
     */
    this.state.page = false;
    this.applyFilters();
  },

  /**
   * Handles change of any of the form inputs
   * @param {Event} event The change event
   *  - Submits the form when a filter is selected
   */
  handleInputChange: function(event) {
    const form = event.target.form;
    const groupList = event.target.closest(this.config.filterGroupQuery);
    const checkedCount = groupList.querySelectorAll('input[type=checkbox]:checked').length;
    const activeFitlersCounter = groupList.querySelectorAll(this.config.activeFilterCountQuery);
    activeFitlersCounter.forEach(counter => counter.innerHTML = checkedCount);
    form.requestSubmit();
  },

  /**
   * Handle the change event for the sort by selector.
   * - Gets current selector value.
   * - Adds the the selector value to the url as a new param.
   * @param {Event} event - The change event.
   */
  handleSortBy: function(event) {
    const value = event.target.value;
    this.state.sortBy = value;
    this.applyFilters();
  },

  /**
   * Applies the filters to the grid section.
   */
  applyFilters: async function() {
    let queryString = objectToQueryString(this.state.filters, '?');

    if (this.state.page) {
      queryString += `&page=${this.state.page}`;
    }

    if (this.state.sortBy) {
      queryString += `&sort_by=${this.state.sortBy}`;
    }

    // Get peroducts grid markup
    const sectionMarkup = await fetch(`${queryString}&section_id=${this.config.gridSection}`).then(response => response.text());
    if (sectionMarkup) this.replaceGrid(sectionMarkup);

    // Update the URL with filters
    const cleanHref = window.location.pathname.split('?')[0];
    const newUrl = `${cleanHref}${queryString.length > 1 ? queryString : ''}`;
    window.history.pushState({
      'html': document.body.innerHTML,
      'pageTitle': `${document.title} - Filtered Products`
    }, '', newUrl);
    
    this.updateProductsCount();
    document.dispatchEvent(new CustomEvent('filtersApplied'));
  },

  /**
   * Clears all filters on the grid section.
   */
  clearAllFilters: async function() {
    // Clear filters and pagination
    this.state.filters = {};
    this.state.page = false;

    // Reset active filters counters
    const activeFitlersCounters = document.querySelectorAll(this.config.activeFilterCountQuery);
    activeFitlersCounters.forEach(counter => counter.innerHTML = 0);

    this.applyFilters();
    document.dispatchEvent(new CustomEvent('filtersCleared'));
  },

  /**
   * Replaces the grid section with the markup returned from the API.
   * @param {String} markup - The new grid markup
   * @returns {void}
   */
  replaceGrid: function(markup) {
    // Get current products grid
    const currentGridElement = document.querySelector(this.config.productsGridQuery);
    if (!currentGridElement) return console.error('replaceGrid: Could not find grid element.');

    // Create new products grid using markup
    let newGridElement = document.createElement('div');
    newGridElement.innerHTML = markup;
    newGridElement = newGridElement.querySelector(`.shopify-section.${this.config.gridSection}`);
    currentGridElement.innerHTML = newGridElement.innerHTML;

    reloadScripts(currentGridElement);
  },

  /**
   * Looks for the paginate items and renders the products count in all
   * counters in the DOM
   */
  updateProductsCount: function() {
    const paginateItems = document.querySelector(this.config.paginateItemsQuery);
    if (paginateItems) {
      this.state.productsCount = paginateItems.dataset.paginateItems;
      const productCounters = document.querySelectorAll(this.config.productsCountQuery);
      productCounters.forEach(counter => {
        counter.innerHTML = this.state.productsCount;
      });
    }
  }

};

window.Filter = Filter;

if (ThemeVars && ThemeVars.template.name == 'collection') {
  Filter.init();
}