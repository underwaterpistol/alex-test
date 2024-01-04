/**
 * This module is for rendering modals using Shopify's section rendering API.
 * 
 * Usage:
 *  1. Create a new instance of the Modal class
 *  2. Pass in the section ID and outer class name
 *  3. Optionally pass in a trigger element
 *  4. Optionally pass in a product handle
 *  5. Optionally pass in a width
 *  6. Optionally pass in a reloadScripts boolean
 * 
 * Example:
 * document.addEventListener('modalReady', () => {
 *  const modal = new Modal({
 *    section: 'modal',
 *    outerClass: 'modal',
 *    trigger: document.querySelector('.modal-trigger'),
 *    productHandle: 'product-handle',
 *    width: 1098,
 *    reloadScripts: true
 *  });
 * });
 */

import { generateModal, reloadScripts } from '../framework/utils';

class Modal {
  static LOADING_SCREEN_MARKUP = `
    <div style="display: flex; width: 100%; height: 100%; min-height: 250px; justify-content: center; align-items: center;">
      <div class="loader__container">
        <div class="loader__inner">
          <div></div>
        </div>
      </div>
    </div>
  `;

  constructor({ section, outerClass, trigger = null, productHandle = null, width = 1098, reloadScripts = false }) {
    if (!this._validateArgs({
      section,
      outerClass
    })) return;

    this.section = section;
    this.outerClass = outerClass;
    this.productHandle = productHandle;
    this.width = width;
    this.reloadScripts = reloadScripts;

    if (trigger) {
      this.setTrigger(trigger);
    }
  }

  /**
   * Validate the arguments passed to the constructor.
   * @param {Object} args - The arguments passed to the constructor.
   * @returns {Boolean} - Whether or not the arguments are valid.
   */
  _validateArgs(args) {
    for (const [key, value] of Object.entries(args)) {
      if (!value) {
        this._showError(`Modal: Could not create modal, requires a ${key}.`);
        return false;
      }
    }
    return true;
  }

  /**
   * Print an error message to the console.
   * @param {String} message - The error message to display.
   * @returns {void}
   */
  _showError(message) {
    console.error(message);
  }

  /**
   * Set the trigger element(s) for the modal.
   * @param {NodeList|Array|Element} triggers - The trigger element(s) for the modal.
   * @returns {void}
   */
  setTrigger = triggers => {
    // If triggers is a NodeList, convert it to an array
    if (NodeList.prototype.isPrototypeOf(triggers)) {
      triggers = Array.from(triggers);
    }
  
    // Check if triggers is an array
    if (Array.isArray(triggers)) {
      // If triggers is an array, iterate over the elements
      triggers.forEach(element => {
        element.addEventListener('click', () => {
          this.createModal();
        });
      });
    } else {
      // If triggers is not an array, assume it's a single element
      triggers.addEventListener('click', () => {
        this.createModal();
      });
    }
  };

  /**
   * Get the modal markup from the Shopify section rendering API.
   * @async
   * @returns {Promise<String>} - A promise that resolves with the modal markup.
   */
  async getMarkup() {
    const url = this.productHandle ? `/products/${this.productHandle}?section_id=${this.section}` : `?section_id=${this.section}`;
    const response = await fetch(url);
    return await response.text();
  }

  /**
   * Create the modal and insert it into the DOM.
   * @async
   * @returns {Promise<void>} - A promise that resolves when the modal is created.
   */
  async createModal() {
    const loadingMarkup = generateModal(this.outerClass, Modal.LOADING_SCREEN_MARKUP, this.width);
    document.body.insertAdjacentHTML('beforeend', loadingMarkup);
    const modalInner = document.querySelector(`.${this.outerClass}__inner`);
    const modalMarkup = await this.getMarkup();
    modalInner.innerHTML = modalMarkup;
    this.handleClose();
    if (this.reloadScripts) {
      reloadScripts(modalInner);
    }
  }

  /**
   * Remove the modal from the DOM.
   * @returns {void}
   */
  destroyModal() {
    const modal = document.querySelector(`.${this.outerClass}`);
    if (modal) modal.remove();
  }

  /**
   * Handle closing the modal. This method is called when the modal is created.
   * it gets triggered when the user clicks on the close button or outside the modal content.
   * @returns {void}
   */
  handleClose() {
    const modal = document.querySelector(`.${this.outerClass}`);
    modal.addEventListener('click', event => {
      // Close the modal when clicking on a close button or outside the modal content
      if (event.target.closest('[data-close-modal]') || !event.target.closest(`.${this.outerClass}__inner`)) {
        this.destroyModal();
      }
    });
  }
}

window.Modal = Modal;
export default Modal;
document.dispatchEvent(new CustomEvent('modalReady'));