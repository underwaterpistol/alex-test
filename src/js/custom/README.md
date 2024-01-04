# Custom modules

This is where you should place your own project specific scripts. 

You can listen for events from framework modules here, and it will also be deferred.

Don't forget to import your module into main.js and expose your code to the window (e.g. `window.myModule = myModule;`) if you will need it there.