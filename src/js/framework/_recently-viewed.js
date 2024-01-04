/**
 * This file keeps track of a users recently viewed products.
 */

const ThemeVars = window.ThemeVars;

const RecentlyViewed = {

  config: {
    maxProducts: 5
  },

  state: {
    products: []
  },

  /**
   * Initialize the Recently Viewed module.
   * - Set the state to the current products in local storage
   * - Make sure the products tracked are not more than the maxProducts config
   * - If user is viewing a product, add it to the list
   * - Emits a recentlyViewedReady event at the end
   */
  init: function () {
    if (localStorage.getItem('recentlyViewed')) {
      this.state.products = JSON.parse(localStorage.getItem('recentlyViewed'));
    }
    if (this.state.products.length > this.config.maxProducts) {
      let deleteCount = this.state.products.length - this.config.maxProducts;
      this.state.products.splice(this.config.maxProducts, deleteCount);
      this.updateProducts(this.state.products);
    }
    if (ThemeVars && ThemeVars.product) {
      this.addProduct(ThemeVars.product);
    }
    document.dispatchEvent(new CustomEvent('recentlyViewedReady'));
  },

  /**
   * Add a product to the list of recently viewed products
   * @param {Object} product - The product to add
   */
  addProduct: function (product) {
    let products = this.state.products;    
    if (products.findIndex(p => p.id == product.id) === -1) {
      if (products.length >= this.config.maxProducts) {
        products.shift();
      }
      products.push(product);
      this.updateProducts(products);
    }
  },

  /**
   * Update the list of recently viewed products
   * - Updates both state and local storage
   * - Emits a recentlyViewedUpdated event at the end
   * @param {Array} products - The products to update
   */
  updateProducts: function (products) {
    this.state.products = products;
    localStorage.setItem('recentlyViewed', JSON.stringify(this.state.products));
    document.dispatchEvent(new CustomEvent('recentlyViewedUpdated'));
  }

};

window.RecentlyViewed = RecentlyViewed;
RecentlyViewed.init();