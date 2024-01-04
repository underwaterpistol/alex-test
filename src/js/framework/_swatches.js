/**
 * Handles the logic for option swatches
 * 
 * document.addEventListener("swatchesReady", function() {
 *   new SwatchGroup({
 *     wrapper: ".some-swatch-wrapper",
 *     productData: {{ product | json }},
 *     swatchData: {{ product.metafields.swatches | json }},
 *     [OPTIONAL] allowUnavailableSelections: true
 *   });
 * });
 * 
 * If you assign the swatch group to a variable, you can access the
 * selectSwatchesFromUrl function.
 * e.g. let swatchGroup = new SwatchGroup({...});
 *      swatchGroup.selectSwatchesFromUrl();
 */

import { makeArrayUnique } from './utils.js';
const ThemeVars = window.ThemeVars;

class SwatchGroup {

  selectedOptions = {};
  variantSelector = null;
  allowUnavailableSelections = false;

  constructor(args) {
    const { wrapper, productData, swatchData, allowUnavailableSelections } = args;

    // Handle basic errors
    if (!wrapper) return console.error('SwatchGroup: Could not create swatch group, requires a wrapper.');
    if (!productData) return console.error('SwatchGroup: Could not create swatch group, requires a productData object.');
    if (!swatchData) return console.error('SwatchGroup: Could not create swatch group, requires a swatchData object.');
    if (!document.querySelector(wrapper)) return console.error('SwatchGroup: Could not create swatch group, wrapper does not exist.');
    if (!ThemeVars) return console.error('SwatchGroup: Could not create swatch group, theme variables do not exist.');
    if (!ThemeVars.hasOwnProperty('swatches')) return console.error('SwatchGroup: Swatches are not enabled in the current theme\'s settings.');

    // Add product and swatch data
    this.wrapper = document.querySelector(wrapper);
    this.productData = productData;
    this.swatchData = swatchData;
    if (allowUnavailableSelections) this.allowUnavailableSelections = allowUnavailableSelections;

    // Generate random key for variant selector
    const variantSelectorKey = Math.random().toString(36).substring(2, 10);

    // Add swatches markup to DOM and set up event listeners
    const variantSelectorMarkup = `
      <select style="display: none;" name="id" id="variant-selector-${this.productData.id}" data-key="${variantSelectorKey}">
        <option value="" selected disabled></option>
        ${this.productData.variants.map(variant => `<option 
          data-option-1="${variant.option1}" 
          data-option-2="${variant.option2}" 
          data-option-3="${variant.option3}" 
          data-available="${variant.available}"
					${variant.featured_media ? `data-media-position="${variant.featured_media.position}"` : ''}
          value="${variant.id}">${variant.title}</option>`).join('')}
      </select>`;
    this.wrapper.insertAdjacentHTML('beforeend', variantSelectorMarkup);
    this.variantSelector = document.querySelector(`[data-key="${variantSelectorKey}"]`);
    this.addSwatchesToDOM();
  }

  /**
   * Adds the swatch markup to the DOM and sets up event listeners
   */
  addSwatchesToDOM() {
    const { wrapper, productData } = this;
    const productOptions = {
      option1: makeArrayUnique(productData.variants.map(variant => variant.option1)),
      option2: makeArrayUnique(productData.variants.map(variant => variant.option2)),
      option3: makeArrayUnique(productData.variants.map(variant => variant.option3))
    };
    Object.keys(productOptions).forEach(optionPosition => {
      const optionName = productData.options[parseInt(optionPosition.replace('option', '')) - 1]; // e.g. Colour
      const optionValues = productOptions[optionPosition]; // e.g. ['Red', 'Blue', 'Green']
      if (optionName && optionValues.length) {
        const { swatches, selector } = this.generateSwatches(optionName, optionPosition, optionValues);
        wrapper.insertAdjacentHTML('beforeend', swatches);
        wrapper.querySelectorAll(selector).forEach(swatch => {
          swatch.addEventListener('click', this.handleSwatchClick.bind(this));
        });
      }
    });
  }

  /**
   * Generates the markup for the swatches for a given option
   * @param {string} optionName - The name of the option e.g. Colour
   * @param {string} optionPosition - The position of the option e.g. option1
   * @param {array} optionValues - The values of the option e.g. ['Red', 'Blue', 'Green']
   * @returns {object} - An object containing the markup and a selector for this set of swatches
   */
  generateSwatches(optionName, optionPosition, optionValues) {
    const selector = `swatch-${optionPosition}`;
    const swatchItemsMarkup = optionValues.map(optionValue => {
      const swatchBackground = this.getSwatchBackground(optionValue);
      let swatchType;
      if (swatchBackground) {
        swatchType = swatchBackground.includes('http') ? 'image' : 'colour';
      } else {
        swatchType = 'text';
      }
      const swatchBackgroundCss = swatchType == 'image' ? `background-image: url(${swatchBackground});` : `background-color: ${swatchBackground};`;
      return `
        <div 
          data-selector="${selector}"
          style="${swatchBackgroundCss}" 
          data-option-index="${optionPosition}" 
          data-option-value="${optionValue}" 
          class="swatch-group__swatch swatch-group__swatch--${swatchType}">
          ${swatchType == 'text' ? `<span>${optionValue}</span>` : ''}
        </div>
      `;
    }).join('\n');
    const swatches = `
      <div class="swatch-group">
        <div class="swatch-group__label">${optionName}</div>
        <div class="swatch-group__swatches">${swatchItemsMarkup}</div>
      </div>
    `;
    return {
      swatches, 
      selector: `[data-selector="${selector}"]`
    };
  }

  /**
   * Handles the click event on a swatch item
   *  - Sets the selected option for this swatch group
   *  - Visibly selects the swatch item
   *  - Marks swatches that would be unavailable with this selection
   *  - Updates the variant selector if a variant is selected and emits an event
   * @param {object} event - The click event
   */
  handleSwatchClick(event) {
    const swatchItem = event.currentTarget;
    const { optionIndex, optionValue } = swatchItem.dataset;
    this.selectedOptions[optionIndex] = optionValue;
    this.visiblySelectSwatch(swatchItem);
    this.markUnavailableSwatches(swatchItem);
    this.setSelectedVariant(this.getSelectedVariant());
    this.setUrlParams(this.getSelectedVariant());
  }

  /**
   * Visibly selects a swatch item with a class and deselects all other sibling swatch items
   * @param {object} swatch - The swatch item to visibly select
   * @returns {function | void} - Either a console error or nothing
   */
  visiblySelectSwatch(swatch) {
    if (!swatch) return console.error('SwatchGroup: Could not visibly select swatch, swatch does not exist.');
    const swatchClass = swatch.classList[0];
    const swatchSiblings = swatch.parentNode.querySelectorAll(`.${swatchClass}`);
    swatchSiblings.forEach(swatchSibling => {
      swatchSibling.classList.remove('selected');
    });
    swatch.classList.add('selected');
  }

  /**
   * Combines a recently selected swatch with all other relevant swatches
   * If this combination would be an unavailable variant, marks the swatch as unavailable
   * Otherwise marks the swatch as available
   * @param {object} selectedSwatch - The swatch that was just selected
   */
  markUnavailableSwatches(selectedSwatch) {
    const swatchClass = selectedSwatch.classList[0];
    const allSwatches = this.wrapper.querySelectorAll(`.${swatchClass}`);
    allSwatches.forEach(swatch => {
      if (selectedSwatch.dataset.optionIndex != swatch.dataset.optionIndex) {
        const temporarySelections = { ...this.selectedOptions };
        temporarySelections[swatch.dataset.optionIndex] = swatch.dataset.optionValue;
        const variant = this.getSelectedVariant(temporarySelections);
        if (variant && variant.dataset.available != 'true') {
          swatch.classList.add('unavailable');
          if (!this.allowUnavailableSelections) {
            swatch.classList.add('disabled');
          }
        } else {
          swatch.classList.remove('unavailable', 'disabled');
        }
      }
    });
  }

  /**
   * Gets the variant that matches some specific option selections
   * @param {object} selections - An object containing the selected options, defaults to the user's selections
   * @returns {HTMLElement} - The variant <option> that matches the selected options
   */
  getSelectedVariant(selections = this.selectedOptions) {
    const variants = Array.from(this.variantSelector.querySelectorAll('option'));
    const selectedVariant = variants.find(variant => {
      return (
        (variant.dataset['option-1'] === selections.option1 || variant.dataset['option-1'] == 'null') &&
        (variant.dataset['option-2'] === selections.option2 || variant.dataset['option-2'] == 'null') &&
        (variant.dataset['option-3'] === selections.option3 || variant.dataset['option-3'] == 'null')
      );
    });
    return selectedVariant;
  }

  /**
   * Sets the selected variant for the variant selector
   * Emits a variantChanged event if a variant is selected
   * @param {object} variant - The variant <option> to select
   */
  setSelectedVariant(variant) {
    if (this.variantSelector && variant) {
      this.variantSelector.value = variant.value;
      const variantChangedEvent = new CustomEvent('variantChanged', {
        detail: {
          wrapper: this.wrapper,
          variant: this.variantSelector.value,
          variantMediaPosition: variant.dataset.mediaPosition,
          available: variant.dataset.available == 'true'
        }
      });
      document.dispatchEvent(variantChangedEvent);
    }
  }

  /**
   * Sets the URL parameter with the selected variant ID
   * @param {object} variant - The selected variant
   */
  setUrlParams(variant) {
    if (variant){
      const baseUrl = window.location.href;
      const params = {
        variant: variant.value
      };
      const getUriWithParam = (baseUrl, params) => {
        const newUrl = new URL(baseUrl);
        const urlParams = new URLSearchParams(newUrl.search);
        for (const key in params) {
          if (params[key] !== undefined) {
            urlParams.set(key, params[key]);
          }
        }
        newUrl.search = urlParams.toString();
        return newUrl.toString();
      };
      window.history.pushState({}, '', getUriWithParam(baseUrl, params));
    }
  }

  /**
   * Gets the background colour or image of a swatch item
   * Defaults to the data from ThemeVars if this product doesn't have specific data for this swatch value
   * @param {string} swatchValue - The value of the swatch e.g. Red
   * @returns {string} - The background colour or image of the swatch item
   */
  getSwatchBackground(swatchValue) {
    return this.swatchData.hasOwnProperty(swatchValue) ? this.swatchData[swatchValue] : ThemeVars.swatches[swatchValue];
  }

  /**
   * Selects swatches in this swatch group based on a variant URL parameter
   * @returns {boolean} - Whether or not swatches were selected
   */
  selectSwatchesFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const variant = urlParams.get('variant');
    const variantSelection = Array.from(this.variantSelector.querySelectorAll('option')).find(option => option.value == variant);
    if (variantSelection && (variantSelection.dataset.available == 'true' || this.allowUnavailableSelections)) {
      this.selectedOptions = {
        option1: variantSelection.dataset['option-1'].replace('null', ''),
        option2: variantSelection.dataset['option-2'].replace('null', ''),
        option3: variantSelection.dataset['option-3'].replace('null', '')
      };
      this.setSelectedVariant(variantSelection);
      Object.keys(this.selectedOptions).forEach(optionIndex => {
        const swatch = this.wrapper.querySelector(`[data-option-value="${this.selectedOptions[optionIndex]}"]`);
        if (swatch) {
          this.visiblySelectSwatch(swatch);
          this.markUnavailableSwatches(swatch);
        }
      });
      return true;
    }
    return false;
  }

}

window.SwatchGroup = SwatchGroup;
document.dispatchEvent(new CustomEvent('swatchesReady'));
