/**
 * This file handles the wishlist functionality.
 * A user does not need to be logged in to have a wishlist.
 * The wishlist is stored in local storage - therefore specific to the browser, not the user.
 * Storing the wishlist on the user or cross device will require a third party service.
 */

const Wishlist = {

  config: {
    maxProducts: 0 // 0 means no limit
  },

  state: {
    products: []
  },

  /**
   * Initialize the Wishlist module.
   * - Set the state to the current products in local storage
   * - Make sure the products tracked are not more than the maxProducts config
   * - Emits a wishlistReady event at the end
   */
  init: function () {
    if (localStorage.getItem('wishlist')) {
      this.state.products = JSON.parse(localStorage.getItem('wishlist'));
    }
    if (this.state.products.length > this.config.maxProducts && this.config.maxProducts != 0) {
      const deleteCount = this.state.products.length - this.config.maxProducts;
      this.state.products.splice(this.config.maxProducts, deleteCount);
      this.updateProducts(this.state.products);
    }
    document.dispatchEvent(new CustomEvent('wishlistReady'));
  },

  /**
   * Add a product to the list of wishlist products
   * - Updates both state and local storage
   * @param {String} handle - The product handle to add
   */
  addProduct: function (handle) {
    if (this.state.products.length >= this.config.maxProducts && this.config.maxProducts != 0) {
      console.error('Wishlist.addProduct() : Cannot add product to wishlist. Max products reached.');
      return;
    }
    const products = this.state.products;
    if (products.findIndex(p => p == handle) === -1) {
      products.push(handle);
      this.updateProducts(products);
    }
  },

  /**
   * Remove a product from the list of wishlist products
   * - Updates both state and local storage
   * @param {String} handle - The product handle to remove
   * @returns {Boolean} - Whether the product was removed or not
   */
  removeProduct: function (handle) {
    const products = this.state.products;
    const index = products.findIndex(p => p == handle);
    if (index !== -1) {
      products.splice(index, 1);
      this.updateProducts(products);
      return true;
    }
    return false;
  },

  /**
   * Toggles a product to remove or add to wishlist
   * - Updates both state and local storage
   * @param {String} handle - The product handle to toggle
   */
  toggleProduct: function (handle) {
    const products = this.state.products;
    const index = products.findIndex(p => p == handle);
    if (index !== -1) {
      products.splice(index, 1);
      this.updateProducts(products);
    } else {
      products.push(handle);
      this.updateProducts(products);
    }
  },
  
  /**
   * Update the list of wishlist products
   * - Updates both state and local storage
   * - Emits a wishlistUpdated event at the end
   * @param {Array} products - The products to update
   */
  updateProducts: function (products) {
    this.state.products = products;
    localStorage.setItem('wishlist', JSON.stringify(this.state.products));
    document.dispatchEvent(new CustomEvent('wishlistUpdated'));
  },

  /**
   * Gets product data of the wishlist products
   * @returns {Array} - The products in the wishlist
   */
  getProducts: async function () {
    const products = await Promise.all(this.state.products.map(async handle => await this.getProduct(handle)));
    return products;
  },

  /**
   * Gets product data of a single product
   * @param {String} handle - The product handle to get
   */
  getProduct: async function (handle) {
    const data = await fetch(`/products/${handle}.js`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(response => response.json());
    return data;
  }

};

window.Wishlist = Wishlist;
Wishlist.init();