Symfony-Webpack boilerplate
===

This is the starting point for your next symfony+webpack project (based on [webpack-bundle](https://github.com/mariusbalcytis/webpack-bundle))
Simply fork this repo and start working!

How to use
---
Before starting, make sure you have [nodejs](https://nodejs.org/en/) and [composer](https://getcomposer.org/) installed

  * Install dependencies
    ```
    npm install
    composer install
    ```

  * Start developing (with hot reloading!)
    ```
    npm start
    ```

  * Compile for production
    ```
    npm run compile
    ```

Dependency management and structure
---
The entry script is located in `app/Resources/assets/script/index.js`. 
You can `require` your libraries and other external files as you normally would in a nodejs environment, and Webpack will take care of the rest. 
This setup is configured in such a way that we can simply use [npm](https://www.npmjs.com/) to manage our vendor dependencies (e.g. AngularJS, Bootstrap, jQuery, etc...)

Example usage
---
For example, to use jQuery in your project:

  * Fetch and save your dependency
    ``` bash
    npm install --save jquery
    ```

  * Now you can use it in your project. In `index.js` file simply write
    ``` js
    var $ = require('jquery');

    // Now do your thing
    $("html").hide();
    ```

You can also use CSS libraries this way. For example, to use [normalize.css](https://www.npmjs.com/package/normalize.css):

  * Fetch and save 
    ``` bash
    npm install --save boostrap
    ```

  * Now require it as you would any other js library
    ``` js
    require('normalize.css'); // Now your page will include the CSS!

    ```

Customization
---
You can add loaders and customize webpack's behaviour by changing the file `app/config/webpack.config.js`
By default, the configuration features:
  * SCSS/LESS preprocessing
  * JSX support
  * Hot reloading
  * Minification + Sourcemap generation

TODO
---
  * TypeScript support