/**
 * This file is responsible for getting product recommendations from the Shopify API.
 * It requires a "seed" product, which is the product that the recommendations are based on.
 * 
 * It uses the following data (dependant on Shopify plan) to generate the recommendations:
 * - Purchase History - Finds products that have historically been purchased with the seed product.
 * - Product Description - Finds products that have similar descriptions to the seed product.
 * - Related Collections - Finds products from collections that the seed product is a part of. Does not include 'all' or 'frontpage' collections.
 * 
 * See the following for more information:
 * https://shopify.dev/themes/product-merchandising/recommendations#recommendation-logic
 * 
 * Use the recommendations object for markup if you are requesting a section:
 * https://shopify.dev/api/liquid/objects/recommendations 
 */

const ProductRecommendations = {

  config: {
    limit: 5 // How many products to return - max is 10
  },

  state: {
    json: null,
    markup: null
  },

  /**
   * Get the product recommendations from the Shopify API.
   * @param {string|integer} seedProduct - The product ID of the seed product.
   * @param {string} section - Optional. A section to render with recommendations.
   * @returns {object} - The product recommendations. Always with json, optionally with markup.
   * @example
   * const recommendations = await ProductRecommendations.getRecommendations(seedProductId);
   * console.log(recommendations.json);
   * console.log(recommendations.markup);
   */
  getRecommendations: async function(seedProduct, section = null) {
    if (!seedProduct) return console.error('getRecommendations: No seed product provided.');
    if (!parseInt(seedProduct)) return console.error('getRecommendations: seedProduct must be a product ID.');
    this.state.json = await this.getJson(seedProduct);
    if (section) this.state.markup = await this.getMarkup(seedProduct, section);
    this.dispatchRecommendationEvent();
    return this.state;
  },

  /**
   * Returns parsed JSON of the product recommendations.
   * @param {string|integer} seedProduct - The product ID of the seed product.
   * @returns {object} - The product recommendations.
   * @example
   * const recommendations = await ProductRecommendations.getJson(seedProductId);
   * console.log(recommendations);
   */
  getJson: async function(seedProduct) {
    const jsonUrl = `${window.Shopify.routes.root}recommendations/products.json?product_id=${seedProduct}&limit=${this.config.limit || 10}`;
    const jsonResponse = await fetch(jsonUrl).then(response => response.json());
    if (jsonResponse.status) {
      console.error(`getJson: ${jsonResponse.description || jsonResponse.message}`);
      return null;
    }
    return jsonResponse;
  },

  /**
   * Returns the product recommendations markup.
   * @param {string|integer} seedProduct - The product ID of the seed product.
   * @param {string} section - The section to render.
   * @returns {string} - The product recommendations markup.
   * @example
   * const markup = await ProductRecommendations.getMarkup(seedProductId, 'related-products');
   * myElement.outerHTML = markup;
   */
  getMarkup: async function(seedProduct, section) {
    const markupUrl = `${window.Shopify.routes.root}recommendations/products?product_id=${seedProduct}&section_id=${section}&limit=${this.config.limit || 10}`;
    const markupResponse = await fetch(markupUrl)
      .then(response => {
        if (!response.ok) {
          if (response.status == 422) console.error('getMarkup: Invalid parameter error - seedProduct was not provided.');
          if (response.status == 404) console.error('getMarkup: Not found error - either the seed product or the section does not exist.');
          if (response.status != 422 && response.status != 404) console.error(`getMarkup: Unknown error - ${response.status}`);
          return '';
        }
        return response.text();
      })
      .catch(error => console.error(`getMarkup: ${error}`));
    return markupResponse;
  },

  /**
   * Dispatches a custom event to the document.
   * Contains the product recommendations data in the event detail.
   */
  dispatchRecommendationEvent: function() {
    const event = new CustomEvent('productRecommendationsReceived', {
      detail: {
        json: this.state.json,
        markup: this.state.markup
      }
    });
    document.dispatchEvent(event);
  }

};

window.ProductRecommendations = ProductRecommendations;
document.dispatchEvent(new CustomEvent('productRecommendationsReady'));