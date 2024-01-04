# UWP Theme Framework V3

### Usage
To build a theme using FW3 either:
* Start a new repository, and use `underwaterpistol/framework-v3` as the template, or
* Use the `Use this template` button in the top right of this repo.

### Documentation
Documentation and demos can be found at [FW2 Docs & Demos](https://fw2-docs-demos.myshopify.com/) - check the `#uwp_framework-v2` channel for the docs password.

### File Structure
The default file structure of FW2 is as follows:
```bash
.
├── README.md
├── .eslintrc.js
├── .gitignore
├── .shopifyignore
├── .theme-check.yml
├── assets
│   └── README.md
├── config
│   ├── README.md
│   ├── settings_data.json
│   └── settings_schema.json
├── layout
│   ├── README.md
│   ├── password.liquid
│   └── theme.liquid
├── package-lock.json
├── package.json
├── sections
│   ├── README.md
│   ├── footer.liquid
│   ├── header.liquid
│   ├── minicart.liquid
│   ├── products_grid.liquid
│   ├── quickshop.liquid
│   └── uwp_splash.liquid
├── snippets
│   ├── README.md
│   ├── header-scripts.liquid
│   └── product-card.liquid
├── src
│   ├── README.md
│   ├── css
│   │   ├── components
│   │   │   ├── README.md
│   │   │   ├── _product-card.scss
│   │   │   ├── _products-grid.scss
│   │   │   └── _swatches.scss
│   │   ├── framework
│   │   │   ├── README.md
│   │   │   ├── _reset.scss
│   │   │   ├── _utils.scss
│   │   │   └── _variables.scss
│   │   ├── main.scss
│   │   └── unique
│   │       ├── README.md
│   │       ├── _footer.scss
│   │       ├── _header.scss
│   │       ├── _minicart.scss
│   │       └── _quickshop.scss
│   └── js
│       ├── custom
│       │   └── README.md
│       ├── framework
│       │   ├── README.md
│       │   ├── _bundles.js
│       │   ├── _cart.js
│       │   ├── _filter.js
│       │   ├── _geo.js
│       │   ├── _infinite-loading.js
│       │   ├── _minicart.js
│       │   ├── _predictive-search.js
│       │   ├── _product-recommendations.js
│       │   ├── _quickshop.js
│       │   ├── _recently-viewed.js
│       │   ├── _swatches.js
│       │   ├── _wishlist.js
│       │   └── utils.js
│       └── main.js
├── templates
│   ├── 404.json
│   ├── README.md
│   ├── article.json
│   ├── blog.json
│   ├── cart.json
│   ├── collection.json
│   ├── customers
│   │   ├── account.json
│   │   ├── activate_account.json
│   │   ├── addresses.json
│   │   ├── login.json
│   │   ├── order.json
│   │   ├── register.json
│   │   └── reset_password.json
│   ├── gift_card.liquid
│   ├── index.json
│   ├── list-collections.json
│   ├── page.json
│   ├── password.json
│   ├── product.json
│   └── search.json
├── uwpDeployHelper.js
├── uwpLintHelper.js
└── uwpSettingsHelper.js
```
