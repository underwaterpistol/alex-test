/**
 * This file handles logic relating to collection products infinite loading.
 */

import { reloadScripts } from './utils.js';
const ThemeVars = window.ThemeVars;

const InfiniteLoading = {

  config: {
    gridSection: 'products_grid',
    scrollOffset: 0
  },

  state: {
    page: 1
  },


  /**
   * Initializes the object if the collection has more than 1 page
   *  - Adds an event listener on the scroll event to load the pages
   *  - Adds an event listener on the filters to reset result pagination
   */
  init: function() {
    if (Math.ceil(ThemeVars.collection.products_count / ThemeVars.collection.products_per_page) > 1) {
      this.boundLoadNextPage = this.loadNextPage.bind(this);
      this.boundResetPagination = this.resetPagination.bind(this);
      const footer = document.querySelector('footer');
      if (footer) this.config.scrollOffset = footer.clientHeight;
      window.addEventListener('scroll', this.boundLoadNextPage);
      document.addEventListener('filtersApplied', this.boundResetPagination);
    }
  },

  /**
   * Loads a new page if the scroll is near the footer/bottom
   */
  loadNextPage: function() {
    const footerInView = document.documentElement.scrollHeight - this.config.scrollOffset < document.documentElement.scrollTop + window.innerHeight;
    if (footerInView) {
      window.removeEventListener('scroll', this.boundLoadNextPage);
      this.state.page++;
      if (this.state.page <= Math.ceil(ThemeVars.collection.products_count / ThemeVars.collection.products_per_page)) {
        this.loadPage().then(() => {
          window.addEventListener('scroll', this.boundLoadNextPage);
        });
      }
    }
  },

  /**
   * Sets page state to 1 and adds event listener on scroll
   */
  resetPagination: function() {
    this.state.page = 1;
    window.addEventListener('scroll', this.boundLoadNextPage);
  },

  /**
   * Fetches the current page filtered if applied.
   */
  loadPage: async function() {
    let filters = window.location.search + '&';
    if (filters == '&') {
      filters = '?';
    }
    const pageMarkup = await fetch(`${filters}section_id=${this.config.gridSection}&page=${this.state.page}`).then(response => response.text());
    if (pageMarkup) this.updateGrid(pageMarkup);
  },

  /**
   * Updates the grid section with the markup returned from the API.
   * @param {String} markup - The new grid markup
   * @returns {void}
   */
  updateGrid: function(markup) {
    const gridQuery = `.shopify-section.${this.config.gridSection}`;
    const gridElement = document.querySelector(gridQuery);
    if (!gridElement) return console.error('updateGrid: Could not find grid element.');
    const settingClasses = gridElement.querySelector('.products-grid')?.classList;
    const products = document.createElement('div');
    products.innerHTML = markup;
    const productsGrid = products.querySelector('.products-grid');
    if (productsGrid) {
      productsGrid.classList = settingClasses;
    }
    if (markup.includes('product-card') && productsGrid) {
      productsGrid.classList.add('has-products');
    }
    gridElement.insertAdjacentHTML('beforeend', products.querySelector(gridQuery).innerHTML);
    reloadScripts(gridElement);
  }

};

if (ThemeVars && ThemeVars.template.name == 'collection') {
  InfiniteLoading.init();
}