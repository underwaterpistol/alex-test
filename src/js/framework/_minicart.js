/**
 * This file handles logic relating to the minicart drawer.
 * See _cart.js for interactions with the Shopify cart object.
 */

import { reloadScripts } from './utils.js';

const Minicart = {

  /**
   * Sets up minicart config.
   * You will need to change this at the start of your project to your own minicart.
   */
  config: {
    drawer: document.querySelector('[data-minicart-drawer]'),
    openClass: 'is-open',
    minicartSection: 'minicart',
    minicartOverlay: document.querySelector('.minicart__overlay'),
    openDrawerOnAdd: true,
		minicartCounterQuery: '[data-cart-count]'
  },

  /**
   * Initialises the minicart.
   */
  init: function () {
    this.setupEventListeners();
    this.setupAccessibility();
    document.dispatchEvent(new CustomEvent('minicartReady'));
  },

  /**
   * Sets up event listeners for the minicart.
   *  - Separated so we can re-add them if the minicart is re-rendered.
   */
  setupEventListeners: async function () {
    document.addEventListener('itemsAddedToCart', () => {
      Minicart.reloadDrawer();
      if (Minicart.config.openDrawerOnAdd) {
        Minicart.openDrawer();
      }
    });
		document.addEventListener('cartDataUpdated', () => {
			const cartCounters = document.querySelectorAll(this.config.minicartCounterQuery);
			cartCounters.forEach(counter => counter.dataset.cartCount = window.Cart.cartData.item_count);
		});
  },

  setupAccessibility: function () {
    const minicartClose = document.querySelector('.minicart__header__close');
    const minicartCheckout = document.querySelector('.minicart__footer__checkout');
    const minicartViewCart = document.querySelector('.minicart__footer__cart');
    let closeTimeout;

    minicartClose.addEventListener('focus', Minicart.openDrawer);
    minicartCheckout.addEventListener('focus', Minicart.openDrawer);
    minicartViewCart.addEventListener('focus', Minicart.openDrawer);

    minicartViewCart.addEventListener('blur', function() {
      closeTimeout = setTimeout(Minicart.closeDrawer, 100);
    });

    minicartCheckout.addEventListener('focus', function() {
      clearTimeout(closeTimeout);
    });
  },

  openDrawer: function () {
    Minicart.config.drawer.classList.add(Minicart.config.openClass);
    Minicart.config.minicartOverlay.classList.add(Minicart.config.openClass);
    document.body.classList.add('minicart-is-open');

  },

  closeDrawer: function () {
    Minicart.config.drawer.classList.remove(Minicart.config.openClass);
    Minicart.config.minicartOverlay.classList.remove(Minicart.config.openClass);
    document.body.classList.remove('minicart-is-open');
  },

  toggleDrawer: function () {
    Minicart.config.drawer.classList.toggle(Minicart.config.openClass);
    Minicart.config.minicartOverlay.classList.toggle(Minicart.config.openClass);
    document.body.classList.toggle('minicart-is-open');
  },

  /**
   * Reloads the minicart drawer markup.
   * Sets up new event listeners.
   * Shows a loading state between.
   */
  reloadDrawer: async function () {
    this.config.drawer.innerHTML = this.loadingScreenMarkup;
    const newMinicartDrawer = await fetch(`?section_id=${this.config.minicartSection}`).then(response => response.text());
    const temporaryElement = document.createElement('div');
    temporaryElement.innerHTML = newMinicartDrawer;
    const newMinicartDrawerMarkup = temporaryElement.querySelector('[data-minicart-drawer]').innerHTML;
    this.config.drawer.innerHTML = newMinicartDrawerMarkup;
    reloadScripts(this.config.drawer);
    this.setupAccessibility();
    document.dispatchEvent(new CustomEvent('minicartReloaded'));
  },

  loadingScreenMarkup: `
    <!-- Loading Screen -->
    <div style="display: flex; width: 100%; height: 100%; min-height: 250px; justify-content: center; align-items: center;">
      <div class="loader__container">
        <div class="loader__inner">
          <div></div>
        </div>
      </div>
    </div>
  `
};

Minicart.init();
window.Minicart = Minicart;
