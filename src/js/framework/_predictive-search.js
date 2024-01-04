/**
 * This file handles interactions relating to predictive search.
 */

import { titleize, removeEmptyKeys, isEmpty } from './utils.js';

const PredictiveSearch = {

  config: {
    inputQuery: '[data-search-input]',
    searchOptions: { // https://shopify.dev/api/ajax/reference/predictive-search#query-parameters
      resources: ['product', 'collection', 'page', 'article'],
      limit: 10,
      unavailable_products: 'last',
      fields: ['title', 'tag', 'product_type', 'variants.title', 'vendor']
    }
  },

  state: {
    searchInput: null,
    resultsElement: null
  },

  /**
   * Initializes the predictive search.
   *  - Sets up the search input.
   *  - Emits an event when ready.
   * @returns {void}
   */
  init: function() {
    this.state.searchInput = document.querySelector(this.config.inputQuery);
    if (!this.state.searchInput) return console.warn('Predictive Search: Did not init - No search input found.');
    if (!(this.state.searchInput instanceof HTMLInputElement)) return console.warn('Predictive Search: Did not init - Search input is not type HTMLInputElement.');
    this.state.searchInput.addEventListener('input', this.handleInput.bind(this));
    this.state.searchInput.addEventListener('focus', this.displayResults.bind(this));
    this.state.searchInput.addEventListener('blur', function() {
      setTimeout(() => {
        PredictiveSearch.hideResults();
      }, '300');
    });
    document.dispatchEvent(new CustomEvent('predictiveSearchReady'));
  },

  /**
   * Handles input on a search input.
   * @param {Event} event - The input event object.
   */
  handleInput: function(event) {
    event.preventDefault();
    const searchQuery = this.state.searchInput.value;
    PredictiveSearch.performSearch(searchQuery);
  },

  /**
   * Performs a search for your query.
   * Builds results and displays them after the search input.
   * Does not perform search if query is empty or less than 3 characters.
   * @param {string} searchQuery - The search query.
   */
  performSearch: async function(searchQuery) {
    if (!searchQuery || !typeof searchQuery == 'String' || searchQuery.length < 3) return; // No message because this is often expected e.g. when the user clears the input.
    const searchUrl = this.getSearchUrl(searchQuery);
    const searchResponse = await fetch(searchUrl).then(response => response.json());
    const searchResults = removeEmptyKeys(searchResponse.resources.results);
    this.state.resultsElement = this.buildResults(searchResults);
    this.state.searchInput.insertAdjacentElement('afterend', this.state.resultsElement);
    this.displayResults();
  },

  /**
   * Converts a search query into a search url using your config.
   * @param {string} searchQuery - The search query.
   * @returns {string} - The search url.
   * @example
   * PredictiveSearch.getSearchUrl('blue');
   * // '/search/suggest.json?q=blue&resources[type]=product,collection,page,article&resources[limit]=10&resources[unavailable_products]=last&resources[fields]=title,tag,product_type,variants.title,vendor'
   */
  getSearchUrl: function(searchQuery) {
    let searchUrl = `/search/suggest.json?q=${searchQuery}`;
    if (this.config.searchOptions.resources) searchUrl += `&resources[type]=${this.config.searchOptions.resources.join(',')}`;
    if (this.config.searchOptions.limit) searchUrl += `&resources[limit]=${this.config.searchOptions.limit}`;
    if (this.config.searchOptions.unavailable_products) searchUrl += `&resources[unavailable_products]=${this.config.searchOptions.unavailable_products}`;
    if (this.config.searchOptions.fields) searchUrl += `&resources[fields]=${this.config.searchOptions.fields.join(',')}`;
    return searchUrl;
  },

  /**
   * Builds the results element.
   * Overwrites the existing results element if it exists.
   * Returns no results markup if no results.
   * @param {Object} searchResults - The search results.
   * @returns {HTMLElement} - The results element.
   */
  buildResults: function(searchResults) {
    const resultsElement = this.state.resultsElement || document.createElement('div');
    resultsElement.classList.add('instant-search__wrapper');
    resultsElement.innerHTML = isEmpty(searchResults) ? this.noResultsMarkup : this.generateResultsMarkup(searchResults);
    return resultsElement;
  },

  /**
   * Generates the results markup for build results if search results are not empty.
   * @param {Object} searchResults - The search results.
   * @returns {string} - The results markup.
   */
  generateResultsMarkup: function(searchResults) {
    return `
      ${Object.keys(searchResults).map(key => `
        <div class="instant-search__group">
          <h3 class="instant-search__title">${titleize(key)} (${searchResults[key].length})</h3>
          ${searchResults[key].map(result => `
            <div class="instant-search__item">
              <a href="${result.url}" class="instant-search__link">${result.title}</a>
            </div>
          `).join('')}
        </div>
      `).join('')}
    `;
  },

  /**
   * Displays the results element if search query is 3 characters or more.
   */
  displayResults: function() {
    if (this.state.searchInput.value.length >= 3) {
      this.state.resultsElement.classList.add('visible');
    }
  },

  /**
   * Hides the results element.
   */
  hideResults: function() {
    this.state.resultsElement.classList.remove('visible');
  },

  /**
   * Returns the no results markup.
   * @returns {string} - The no results markup.
   */
  noResultsMarkup: '<p>No results</p>'

};

window.PredictiveSearch = PredictiveSearch;
PredictiveSearch.init();