# Javascript cookie control

Javascript module for controling cookie consent on your website.

## Install

Install the Node dependency:
```
yarn add @netgen/javascript-cookie-control
```
or
```
npm install --save @netgen/javascript-cookie-control
```

### Load

To load the required ES2015 module:
```js
import CookieControl from '@netgen/javascript-cookie-control';
```

## Usage

### HTML
HTML markup for cookie control window shoud be:
```html
<div id="ng-cc">

    <!-- if you don't want to use the overlay, remove next div from the markup -->
    <div class="ng-cc-overlay"></div>

    <!-- button for opening the window. Leave out if you don't need it -->
    <a href="#" class="js-open-ng-cc">Cookie settings</a>

    <div class="ng-cc-modal">

        <!-- button for closing the window. Leave out if you don't need it -->
        <a href="#" class="ng-cc-close ng-cc-close-btn">close</a>

        <div class="ng-cc-content">
            <div class="wrapper">
                <h3>This site uses cookies.</h3>
                <p>Some text describing your cookie usage...</p>

                <div class="ng-cc-actions">
                    <a href="#" class="optional-list-toggle">
                        <span>Customize settings!</span>
                        <span class="cookie-angle-up"></span>
                    </a>

                    <!-- button for accepting selected cookies and closing the window -->
                    <button id="ng-cc-accept" class="btn btn-primary">I'm ok with this</button>
                </div>
            </div>
            <div class="ng-cc-optional-list">
                <ul>
                    <!-- markup for the single cookie group (should be the same as the ones generated with js) -->
                    <li>
                        <input type="checkbox" class="ng-cc-optional-checkbox" id="ng-cc-necessary" data-name="necessary" checked disabled />
                        <label for="ng-cc-necessary">
                            <i class="ng-cc-checkbox-icon">
                              <span class="on ng-cc-on">Accepted</span>
                              <span class="off ng-cc-off">Not accepted</span>
                            </i>
                            Necessary Cookies
                        </label>
                        <p>This website cannot function properly without these cookies.</p>
                    </li>

                    <!-- this is where optional cookie groups are rendered -->
                </ul>
                <div class="ng-cc-optional-actions clearfix">
                  <button id="ng-cc-optional-save" class="btn btn-outline-primary">
                    Save settings
                  </button>
                </div>
            </div>

            
        </div>
    </div>
</div>
```

### JS

Create config object for cookie control plugin and initialize it:
```js
const ccConfig = {
  options: {
    lifetime: 30,
  },
  optionalCookies: [
    {
      name: 'analytics',
      label: 'Analytical Cookies',
      description: 'Analytical cookies help us to improve our website by collecting and reporting information on its usage.',
      accepted: true,
      onRevoke() {
        window['ga-disable-XX-XXXXX-X'] = true;
      },
    },
    {
      name: 'marketing',
      label: 'Marketing Cookies',
      description: 'We use marketing cookies to help us improve the relevancy of advertising campaigns you receive.',
    },
    {
      name: 'socialsharing',
      label: 'Social Sharing Cookies',
      description: 'We use some social sharing plugins, to allow you to share certain pages of our website on social media',
      onAccept: () => {
        (function(d, s, id) {
          var js, fjs = d.getElementsByTagName(s)[0];
          if (d.getElementById(id)) return;
          js = d.createElement(s); js.id = id;
          js.src = 'https://connect.facebook.net/en_GB/sdk.js#xfbml=1&version=v3.0';
          fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
      },
    },
  ],
};

// create new cookie control instance
const cookieControl = new CookieControl(ccConfig);
// initialize the plugin
cookieControl.init();
```

Second parameter for initializing new instance is optional string with the id of the plugin div. Default value is `ng-cc`.
So if you need to change it, use it like this:
```js
const cookieControl = new CookieControl(ccConfig, 'new-id');
```

### Parameters for cookie control config:

Config object has two parameters.

| Parameter | Type | Default value | Description |
| :--- | :--- | :--- | :--- |
| `options` | Object | | General options for the plugin |
| `optionalCookies` | Array | | Array of objects for optional cookie groups |

Parameters for the `options` object (all are optional):

| Parameter | Type | Default value | Description |
| :--- | :---  | :--- | :--- |
| `open` | boolean | true | Open the window on page load (doesn't open once the user accepts the cookies) |
| `lifetime` | number | 365 | Lifetime of the saved cookie settings (in days) |
| `domain` | string | | Domain for the saved cookie (e.g., 'example.com' or 'subdomain.example.com'). If not specified, this defaults to the host portion of the current document location. |
| `acceptValue` | string | '1' | Value saved for the accepted cookie group |
| `revokeValue` | string | '0' | Value saved for the revoked cookie group |
| `timeout` | number | 200 | Timeout for auto open on page load (in milliseconds) |
| `optionCookieHtml(cookie)` | function | | Function returning template for single optional cookie group. Function takes one object as parameter which has values for `name` (string), `label` (string), `description` (string) and `accepted` (boolean) and should return string with html |
| `onChange(event, instance)` | function | | Function that gets executed on cookie group checkbox change. Function has two arguments. First one is checkbox change event from which you can get cookie group name (`e.target.dataset.name`) and if it's accepted or not (`e.target.checked`), and the other is instance of the plugin |
| `onAccept(instance)` | function | | Function that gets executed on cookie accept button. Function has one argument, instance of the plugin |


Parameters for each `optionalCookies` object:

| Parameter | Type | Default value | Description |
| :--- | :--- | :--- | :--- |
| `name` | string | | Name of the cookie group (used for storing the value) |
| `label` | string | | Label for cookie group which is rendered in window next to the checkbox |
| `description` | string | | Description for the cookie group rendered below checkbox and label |
| `cookieName` (optional) | string | `ng-cc-` + `name` | Name for storing cookie group consent |
| `accepted` (optional) | boolean | false | Set to true if you want that cookie group to be enabled by default |
| `onAccept` (optional) | function | | Function that gets executed on plugin init if the cookie group is enabled |
| `onRevoke` (optional) | function | | Function that gets executed on plugin init if the cookie group is disabled |

You can modify options of the plugin after creating the instance with `set('option', new_value)` function.
e.g.:
```js
cookieControl.set('onChange', (e, instance) => {
  console.log(e, instance);
});
```

#### Behaviour
There is an event listener for the click on html elements containing css class `js-open-ng-cc` which opens the window. You can put it anywhere on your site if you need to.

On every cookie group checkbox change, plugin saves the cookie with that cookie name and accept or revoke value.

Window opens on every page load until user clicks the `#ng-cc-accept` button (if the `open` parameter isn't set to `false`). After that, the window doesn't open automatically for the duration of the cookie lifetime.

### SCSS
Import styles to scss file:
```scss
@import "@netgen/javascript-cookie-control/scss/style";
```

You also need to configure sass-loader to understand imports from node_modules. Update your sass-loader config by changing `{ loader: 'sass-loader' }` to:
```js
{
  loader: 'sass-loader',
  options: {
    includePaths: ['node_modules']
  }
}
```

You can override scss variables for main div id, plugin window width and background:
```scss
$ngCcId: 'ng-cc';
$ngCcWidth: 28em;
$ngCcBg: hsl(0, 0, 15);
```
