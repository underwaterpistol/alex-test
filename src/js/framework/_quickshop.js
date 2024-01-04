/**
 * This file handles rendering and interactions with the quick shop modal.
 */

import Modal from './_modal';

const Quickshop = {

  config: {
    section: 'quickshop', // Section to display inside modal
    quickshopClass: 'quickshop-modal', // Modal outer class
    triggerQuery: '[data-quickshop]', // Query selector for quickshop trigger
    handleAttribute: 'data-quickshop' // Attribute to use for quickshop handle
  },

  state: {
    atcEvent: null
  },

  /**
   * Initialize the quickshop object.
   *  - Add event listeners to all trigger elements.
   */
  init: function() {
    const triggerElements = document.querySelectorAll(this.config.triggerQuery);
    triggerElements.forEach(triggerElement => {
      // Check if the button already has the event listener so is not added again.
      if (!triggerElement.dataset.hasClickEvent) {
        triggerElement.addEventListener('click', this.handleTriggerClick.bind(this));
      }
      triggerElement.dataset.hasClickEvent = 'true';
    });
  },

  /**
   * Handle the click event on a quickshop trigger.
   *  - Prevents default action.
   *  - Get the handle attribute value.
   *  - Create a quickshop for this product hanlde.
   * @param {object} event - The click event.
   */
  handleTriggerClick: function(event) {
    event.preventDefault();
    
    // Load swatches module if not already loaded
    if (typeof SwatchGroup === 'undefined') {
      import('./_swatches.js');
    }
    const target = event.target;
    const handle = target.getAttribute(this.config.handleAttribute);
    const quickShopModal = new Modal({
      section: this.config.section,
      outerClass: this.config.quickshopClass,
      productHandle: handle,
      reloadScripts: true
    });

    quickShopModal.createModal();
    const destroyModalHandler = () => {
      quickShopModal.destroyModal();
      document.removeEventListener('itemsAddedToCart', destroyModalHandler);
    };
    this.state.atcEvent = document.addEventListener('itemsAddedToCart', destroyModalHandler);
  }

};

window.Quickshop = Quickshop;
document.dispatchEvent(new CustomEvent('quickshopReady'));