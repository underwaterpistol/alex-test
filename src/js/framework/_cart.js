/**
 * This file handles interactions with the Shopify cart object.
 */

import { getParamsFromForm } from './utils.js';

const Cart = {
  /**
   * Sets up the cart object.
   * Values will be provided with init.
   * The keys are snake case to preserve parity with the Shopify cart object.
   */
  cartData: {
    attributes: {},
    cart_level_discount_applications: [],
    currency: '',
    item_count: 0,
    items: [],
    items_subtotal_price: '',
    note: null,
    original_total_price: 0,
    requires_shipping: false,
    token: null,
    total_discount: 0,
    total_price: 0,
    total_weight: 0
  },

  /**
   * Initialises the cart object.
   */
  init: async function() {
    document.addEventListener('itemsAddedToCart', () => {
      this.setCartData();
    });
    document.addEventListener('cartUpdated', () => {
      this.setCartData();
    });
    const atcForms = document.querySelectorAll('form[data-productForm="true"]');
    atcForms.forEach(form => {
      form.addEventListener('submit', this.handleAtcSubmit);
    });
    await this.setCartData();
    document.dispatchEvent(new CustomEvent('cartReady'));
  },

  /**
   * Updates the cartData attribute with the current state of the cart from the API.
   */
  setCartData: async function () {
    const cartData = await fetch('/cart.js').then(response => response.json());
    this.cartData = { ...cartData };
    document.dispatchEvent(new CustomEvent('cartDataUpdated'));
  },

  /*
   * ================================================
   * 
   *                  ADDING ITEMS
   * 
   * ================================================
   */

  /**
   * Handles submission of an add to cart form for a single variant.
   * @param {Event} event The submit event.
   */
  handleAtcSubmit: async function(event) {
    event.preventDefault();
    const form = event.target;
    const params = getParamsFromForm(form);
    if (!params.id) return console.error('handleAtcSubmit: No variant ID found in form.');
    const quantity = params.quantity || 1;
    const selling_plan = params.selling_plan || '';
    const propertyInputKeys = Object.keys(params).filter(key => key.startsWith('properties'));
    const properties = {};
    propertyInputKeys.forEach(key => {
      const propertyName = key.replace('properties[', '').replace(']', '');
      properties[propertyName] = params[key];
    });
    Cart.addItem(params.id.toString(), parseInt(quantity), properties, selling_plan);
  },


  /**
   * Adds a single item to the cart.
   * @param {String|Integer} id - The variant ID for the item to add.
   * @param {Integer} quantity - The quantity of the item to add. Defaults to 1.
   * @param {Object} properties - Optional properties to add to the cart item.
   * @param {String} selling_plan - Selling plan ID for subscription items (Required for subscriptions, optional for one-time purchases).
   * @returns {void}
   */
  addItem: function (id, quantity = 1, properties = {}, selling_plan = '') {
    if (!id) return console.error('Cart.addItem() : id is required.');
    const item = {
      id,
      quantity,
      properties,
      selling_plan
    }; // e.g. {id: '12345', quantity: 1, properties: {'Gift Message': 'Happy Birthday!'}}
    this.sendAddToCart([item]);
  },

  /**
   * Adds multiple items to the cart.
   * @param {Array} items - An array of objects containing the item data. Each should match format of Cart.addItem().
   * @returns {void}
   */
  addMultipleItems: function (items) {
    if (!items || !items.length) return console.error('Cart.addMultipleItems() : items is required.');
    this.sendAddToCart(items);
  },

  /**
   * Sends the add to cart form to Shopify.
   * NOTE: You should use addItems or addMultipleItems instead of this method directly.
   * @param {Array} items - An array of objects containing the item data. Each should match format of Cart.addItem().
   */
  sendAddToCart: function (items) {
    fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({ items })
    }).then(response => response.json()).then(cart => {
      if (cart.status) console.error(`Cart.sendAddToCart() : ${cart.description || cart.message || 'Unknown error'}`);
      else document.dispatchEvent(new CustomEvent('itemsAddedToCart'));
    });
  },

  /*
   * ================================================
   * 
   *            UPDATING CART PROPERTIES
   * 
   * ================================================
   */

  /**
   * Adds a note to the current cart. 
   * @param {String} note - The note to add.
   */
  addNote: function (note) {
    const updateBody = { note }; // E.g. {note: 'This is a note'}
    this.sendCartUpdate(updateBody);
  },

  /**
   * Adds a single cart attribute to the current cart.
   * @param {String} key - The key of the attribute to add.
   * @param {String} value - The value of the attribute to add.
   */
  addAttribute: function (key, value) {
    const updateBody = { attributes: { [key]: value } };
    this.sendCartUpdate(updateBody);
  },

  /**
   * Adds multiple cart attributes to the current cart.
   * @param {Object} attributes - An object containing the attributes to add.
   * Example: {'Gift Message': 'Happy Birthday!', 'Gift Wrap': 'true'}
   */
  addMultipleAttributes: function (attributes) {
    const updateBody = { attributes };
    this.sendCartUpdate(updateBody);
  },

  /**
   * Sends a cart update request to Shopify.
   * Fires the 'cartUpdated' event if successful.
   * @param {Object} updateBody - The body of the update request.
   */
  sendCartUpdate: function (updateBody) {
    fetch('/cart/update.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(updateBody)
    }).then(response => response.json()).then(cart => {
      if (cart.status) console.error(`Cart.sendCartUpdate() : ${cart.description || cart.message || 'Unknown error'}`);
      else document.dispatchEvent(new CustomEvent('cartUpdated'));      
    });
  },

  /*
   * ================================================
   * 
   *             CHANGING LINE ITEM DATA
   * 
   * ================================================
   */

  /**
   * Change the quantity of an item in the cart. 
   * @param {String|Integer} itemId - The variant ID or 1-based index position for the item to update.
   * @param {Integer} quantity - The new quantity of the item.
   * @returns {void}
   */
  changeItemQuantity: function (itemId, quantity) {
    if (!itemId || !quantity) return console.error('Cart.changeItemQuantity() : itemId and quantity are required.');
    const itemKey = parseInt(itemId) < 1000 ? 'line' : 'id';
    const changeBody = {
      [itemKey]: itemId.toString(),
      'quantity': parseInt(quantity)
    };
    this.sendCartChange(changeBody);
  },

  /**
   * Changes custom properties of an item in the cart. 
   * @param {String|Integer} itemId - The variant ID or 1-based index position for the item to update.
   * @param {Object} properties - The new properties of the item.
   * @returns {void}
   * Example: {'Gift Message': 'Happy Birthday!', 'Gift Wrap': 'true'}
   */
  changeItemProperties: function (itemId, properties = {}) {
    if (!itemId) return console.error('Cart.changeItemProperties() : itemId is required.');
    if (!properties || Object.keys(properties).length === 0) return console.error('Cart.changeItemProperties() : properties is required and cannot be empty.');
    const itemKey = parseInt(itemId) < 1000 ? 'line' : 'id';
    const changeBody = {
      [itemKey]: itemId.toString(),
      'properties': properties
    };
    this.sendCartChange(changeBody);
  },

  /**
   * Sends a cart change request to Shopify. 
   * NOTE: You should use changeItemQuantity or changeItemProperties instead of this method directly.
   * NOTE: This method will trigger the 'cartUpdated' event, rather than a 'cartChanged' event.
   * @param {Object} changeBody - The body of the change request.
   */
  sendCartChange: function (changeBody) {
    fetch('/cart/change.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(changeBody)
    }).then(response => {
      if (response.status && response.status != 200) { 
        console.error(`Cart.sendCartChange() : ${response.status == 404 ? 'Item not in cart' : 'Unknown error'}`);
      } else {
        document.dispatchEvent(new CustomEvent('cartUpdated'));      
      }
    });
  }
};

export default Cart;

window.Cart = Cart;
Cart.init();