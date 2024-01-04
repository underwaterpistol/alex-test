# Framework Modules

This folder contains all default framework modules.

You shouldn't add new files here, new/project specific script should sit in the custom js directory (typically src/js/custom). As a general rule of thumb, if you're not directly changing how a framework module behaves, the code does not belong in this directory. 

Most actions emit events that you can listen for in your own code, and for those that don't it may be more appropriate for you to modify the framework module to emit an event, rather than adding your actions directly to the framework modules. 

Feel free to add actions and modify code in the framework modules when it does make sense to do so, just be sure to keep the structure of the framework modules as close to the default as possible.

Examples:
1) I want to change the loading screen for the minicart reload. - Modify the _minicart.js framework module.
2) I want to add classes to the swatch markup. - Modify the _swatches.js framework module.
3) I want to add a step between a user submitting the add to cart form and the form being posted. - Add an action to _cart.js and modify the existing sendAddToCart action to use it.
4) I want to add an upsell modal after a user has submitted the add to cart and the form was posted. - Add your own script outside the framework, and listen for the itemsAddedToCart event.
5) I want to add an action to change the product image when a variant is selected. - Add your own script outside the framework modules and listen for the variantChanged event. 