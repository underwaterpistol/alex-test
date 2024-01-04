/**
 * This file provides utilities for creating a "bundle" of products that can be added to the cart.
 * 
 * Example usage:
 * var myBundle = new Bundle();
 * myBundle.addProduct(handle, variantId);
 * myBundle.addProduct(handle, variantId2, quantity, {"Gift Message": "Happy Birthday!"});
 * myBundle.removeProduct(variantId); 
 * myBundle.addToCart();
 * 
 * var myBundleProducts = myBundle.products;
 */

import Cart from './_cart';

class Bundle {

  constructor() {
    this.products = [];
  }

  /**
   * Adds a product to the current bundle.
   * @param {String} handle - The handle of the product to add.
   * @param {String} id - The ID of the variant to add.
   * @param {Integer} quantity - The quantity of the item to add. Defaults to 1.
   * @param {Object} properties - Optional properties to add to the cart item.
   * @returns {Bundle} - Returns the current bundle.
   */
  async addProduct(handle, id, quantity = 1, properties = {}) {
    const productJson = await fetch(`/products/${handle}.js`).then(response => response.json());
    if (productJson.variants) {
      productJson.variants = productJson.variants.filter(variant => variant.id.toString() === id.toString());
    }
    const product = {
      data: productJson,
      quantity,
      properties
    };
    this.products.push(product);
    document.dispatchEvent(new CustomEvent('bundleProductsChanged', { detail: this.products }));
    return this;
  }

  /**
   * Removes all products that match the query (handle or variant ID) from the bundle.
   * Removes all products if no arguments are provided.
   * @param {String} query - The handle or variant ID of the product to remove.
   * @returns {Bundle} - Returns the current bundle.
   */
  removeProduct(query) {
    if (query) {
      this.products = this.products.filter(product => {
        return product.data.handle !== query && product.data.variants[0].id.toString() !== query.toString();
      });
    } else {
      this.products = [];
    }
    document.dispatchEvent(new CustomEvent('bundleProductsChanged', { detail: this.products }));
    return this;
  }

  /**
   * Sets the quantity of a product in the bundle.
   * @param {String} query - The handle or variant ID of the product to change.
   * @param {Integer} quantity - The new quantity of the product.
   * @returns {Bundle} - Returns the current bundle.
   */
  setQuantity(query, quantity) {
    if (!query) return console.error('setQuantity: query (either handle or variant id) is required.');
    if (!quantity) return console.error('setQuantity: quantity is required.');
    this.products = this.products.map(product => {
      if (product.data.handle === query || product.data.variants[0].id.toString() === query.toString()) {
        product.quantity = quantity;
      }
      return product;
    });
    document.dispatchEvent(new CustomEvent('bundleProductsChanged', { detail: this.products }));
    return this;
  }

  /** 
   * Removes a product from the bundle at a specific index.
   * @param {Integer} index - The index of the product to remove.
   * @returns {Bundle} - Returns the current bundle.
   */
  removeProductAtIndex(index) {
    if (!index) return console.error('removeProductAtIndex: index is required.');
    this.products.splice(index, 1);
    document.dispatchEvent(new CustomEvent('bundleProductsChanged', { detail: this.products }));
    return this;
  }

  /**
   * Adds the bundle to the cart.
   * Note: Cart dispatches it's own "itemsAddedToCart" event if successful.
   */
  addToCart() {
    const products = this.products.reduce((accumulator, product) => {
      const existingProduct = accumulator.find(p => p.data.handle === product.data.handle);
      if (existingProduct) {
        existingProduct.quantity += product.quantity;
      } else {
        accumulator.push(product);
      }
      return accumulator;
    }, []);
    const productsWithIds = products.map(product => {
      return {
        id: product.data.variants[0].id,
        quantity: product.quantity,
        properties: product.properties
      };
    });
    Cart.addMultipleItems(productsWithIds);
  }

}

window.Bundle = Bundle;
document.dispatchEvent(new CustomEvent('bundlesReady'));