/**
 * This is the main script file for the theme.
 * All the other scripts are loaded here.
 *
 * This file is deferred, so it will be downloaded asynchronously,
 * but only executed when DOM is ready. You do not need to wait
 * for the DOM to be ready in these scripts.
 *
 * You should make use of custom events in the DOM to wait
 * for parts of the application to be loaded.
 * Example: document.addEventListener('swiperReady', () => {
 *   new Swiper('.swiper-container', {.. etc});
 * });
 *
 * Please comment out any modules you are not using
 * in order to keep the theme lightweight.
 *
 * Remember to keep your code clean, readable and maintainable.
 * Keep your code DRY. https://codinglead.co/javascript/what-is-DRY-code
 * Write code for humans. Parcel will build it for machines.
 * Use the linter. $ npm run lint
 */

// Main site styles
import '../css/main.scss';


/*
 * **************************
 *
 *     Framework Modules
 *
 * **************************
 */
const ThemeVars = window.ThemeVars;
import './framework/_geo.js';
import './framework/_recently-viewed.js';
import './framework/_cart.js';
import './framework/_minicart.js';
import './framework/_wishlist.js';
import './framework/_quickshop.js';
import './framework/_predictive-search.js';
import './framework/_product-recommendations.js';
import './framework/_modal.js';

if (ThemeVars.template.name === 'collection') {
  import('./framework/_filter.js');
  import('./framework/_infinite-loading.js');
}

if (ThemeVars.template.name === 'product') {
  import('./framework/_swatches.js');
  import('./framework/_bundles.js');
}

// Custom JS
import './custom/_lazy-video.js';

// Expose any required utilities to the window
import { toMoneyString, getVariantImageIndexes, getVariantSlides } from './framework/utils.js';
window.toMoneyString = toMoneyString;
window.getVariantImageIndexes = getVariantImageIndexes;
window.getVariantSlides = getVariantSlides;


/*
 * **************************
 *
 *         Swiper
 *
 * **************************
 */
import { Swiper, Navigation, Pagination, Autoplay, Thumbs, Manipulation } from 'swiper';
import 'swiper/swiper.css';
import 'swiper/modules/autoplay/autoplay.min.css';
import 'swiper/modules/navigation/navigation.min.css';
import 'swiper/modules/pagination/pagination.min.css';
import 'swiper/modules/thumbs/thumbs.min.css';
Swiper.use([Navigation, Pagination, Autoplay, Thumbs, Manipulation]);
window.Swiper = Swiper;
document.dispatchEvent(new CustomEvent('swiperReady'));


/*
 * **************************
 *
 *    Preview Bar Toggle
 *
 * **************************
 */
const previewToggleEnabled = true;

// Only show the toggle if the theme is not the live theme. Note: This property is deprecated and may lose support, that's why we use the opposite of checking if the theme is live.
if (previewToggleEnabled && (ThemeVars && (ThemeVars.theme.role == 'unpublished' || ThemeVars.theme.role == 'demo' || ThemeVars.theme.role == 'development'))) {
  const previewBarToggle = document.createElement('div');
  previewBarToggle.classList.add('preview-bar-toggle');
  previewBarToggle.innerHTML = `<span class="preview-bar-toggle__icon">
      <?xml version="1.0" ?><!DOCTYPE svg  PUBLIC '-//W3C//DTD SVG 1.1//EN'  'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'><svg enable-background="new 0 0 32 32" height="32px" id="Layer_1" version="1.1" viewBox="0 0 32 32" width="32px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g><polyline fill="none" points="   649,137.999 675,137.999 675,155.999 661,155.999  " stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2"/><polyline fill="none" points="   653,155.999 649,155.999 649,141.999  " stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2"/><polyline fill="none" points="   661,156 653,162 653,156  " stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2"/></g><g><g><path d="M16,25c-4.265,0-8.301-1.807-11.367-5.088c-0.377-0.403-0.355-1.036,0.048-1.413c0.404-0.377,1.036-0.355,1.414,0.048    C8.778,21.419,12.295,23,16,23c4.763,0,9.149-2.605,11.84-7c-2.69-4.395-7.077-7-11.84-7c-4.938,0-9.472,2.801-12.13,7.493    c-0.272,0.481-0.884,0.651-1.363,0.377c-0.481-0.272-0.649-0.882-0.377-1.363C5.147,10.18,10.333,7,16,7    c5.668,0,10.853,3.18,13.87,8.507c0.173,0.306,0.173,0.68,0,0.985C26.853,21.819,21.668,25,16,25z"/></g><g><path d="M16,21c-2.757,0-5-2.243-5-5s2.243-5,5-5s5,2.243,5,5S18.757,21,16,21z M16,13c-1.654,0-3,1.346-3,3s1.346,3,3,3    s3-1.346,3-3S17.654,13,16,13z"/></g></g></svg>
    </span>`;
  previewBarToggle.addEventListener('click', () => {
    const previewBar = document.querySelector('#preview-bar-iframe');

    // Replace preview URL
    const shareThemeUrl = previewBar.contentWindow.document.querySelector('#share_theme_url');
    if (shareThemeUrl) {
      const previewUrl = `${window.location.href}?preview_theme_id=${ThemeVars.theme.id}`;
      shareThemeUrl.value = previewUrl;
    }

    // Toggle preview bar
    previewBar && previewBar.classList.toggle('closed');
    previewBar && previewBarToggle.classList.toggle('open');
    previewBarToggle.style.bottom = previewBar && previewBarToggle.classList.contains('open') ? `calc(${previewBar.offsetHeight}px + 1rem)` : '';
  });
  document.body.appendChild(previewBarToggle);

  // Use a mutation observer to wait for an element with id "preview-bar-iframe" to be added to the DOM
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.type == 'childList' && mutation.addedNodes.length > 0) {
        const previewBar = document.querySelector('#preview-bar-iframe');
        if (previewBar) {
          previewBar.classList.add('closed');
        }
      }
    });
  });
  observer.observe(document.body, { childList: true });

  // If the preview bar is already in the DOM, add the class "closed" to it
  const previewBar = document.querySelector('#preview-bar-iframe');
  if (previewBar) previewBar.classList.add('closed');
}