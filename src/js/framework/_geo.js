/**
 * This file contains geolocation code. 
 * It's primary function is to return location data,
 * not to actually perform any redirection etc.
 * You should consume this data and perform your own actions.
 */

import { isEmpty } from './utils';
const lookup = require('country-code-lookup');
 
const Geo = {
 
  /**
   * Gets data about the users location.
   * @returns {object} Information about the users location.
   */
  getUserLocationData: async function () {
    const userData = await this.getUserData();
    if (userData == null || userData === '') {
      console.warn('Geo.getUserLocationData() : userData is unavailable.');
      return undefined;
    }
    const countryCode = userData.loc;
    const locationData = lookup.byIso(countryCode);
    return locationData;
  },
 
  /**
   * Returns the user data from storage if available.
   * If not, returns user data from the API and also stores it in storage.
   * @returns {object} The user data.
   */
  getUserData: async function () {
    let userData = await this.getUserDataFromStorage();
    if (!userData || isEmpty(userData)) {
      console.log('No user data found in storage, fetching from API instead...');
      userData = await this.getUserDataFromAPI();
      window.localStorage.setItem('userData', JSON.stringify(userData));
    }
    return userData;
  },
 
  /**
   * Returns the user data from storage if available.
   * @returns {object} The user data.
   */
  getUserDataFromStorage: async function () {
    let userData = localStorage.getItem('userData');
    if (userData) userData = JSON.parse(userData);    
    return userData;
  },
 
  /**
   * Returns the user data from the API.
   * @returns {object} The user data.
   */
  getUserDataFromAPI: async function () {
    // We can use cloudflare because Shopify is already using Cloudflare's CDN.
    const userData = await fetch('https://www.cloudflare.com/cdn-cgi/trace').then(res => res.text());
    const userDataArray = userData.split('\n');
    const userDataObject = {};
    userDataArray.forEach(function (line) {
      const lineArray = line.split('=');
      userDataObject[lineArray[0]] = lineArray[1];
    });
    return userDataObject;
  }
 
};
 
window.Geo = Geo;
document.dispatchEvent(new Event('geoReady'));