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

#### HTML
HTML markup for cookie control window shoud be:
```html
<div id="ng-cc">

    <!-- if you don't want to use the overlay, remove next div from the markup -->
    <div class="ng-cc-overlay"></div>

    <div class="ng-cc-modal">
        
        <!-- button for closing the window. Leave out if you don't need it -->
        <a href="#" class="ng-cc-close ng-cc-close-btn"><i class="fa fa-times"></i></a>

        <div class="ng-cc-content">
            <h3>This site uses cookies.</h3>
            <p>Some text describing your cookie usage...</p>
            <ul class="ng-cc-optional-list">
                <!-- markup for the single cookie group (should be the same as the ones generated with js) -->
                <li>
                    <input type="checkbox" class="ng-cc-optional-checkbox" id="ng-cc-necessary" data-name="necessary" checked disabled />
                    <label for="ng-cc-necessary">
                        <i class="ng-cc-checkbox-icon"><span></span></i>
                        Necessary Cookies
                    </label>
                    <p>This website cannot function properly without these cookies.</p>
                </li>

                <!-- this is where optional cookie groups are rendered -->

            </ul>

            <div class="ng-cc-actions">
                <!-- button for accepting selected cookies and closing the window -->
                <button id="ng-cc-accept" class="btn btn-primary">I'm ok with this</button>
            </div>
        </div>
    </div>
</div>
```

#### JS

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

### Parameters for cookie control config:

Config object has two parameters.
| Parameter         | Type    | Default value                 | Description                                      |
| ----------------- | ------- | ----------------------------- | ------------------------------------------------ |
| `options`         | Object  |                               | General options for the plugin                   |
| `optionalCookies` | Array   |                               | Array of objects for optional cookie groups      |

Parameters for the `options` object:
| Parameter                  | Type     | Default value | Description                                                                   |
| -------------------------- | -------  | ------------- | ----------------------------------------------------------------------------- |
| `open`                     | boolean  | true          | Open the window on page load (doesn't open once the user accepts the cookies) |
| `lifetime`                 | number   | 365           | Lifetime of the saved cookie settings (in days)                               |
| `acceptValue`              | string   | '1'           | Value saved for the accepted cookie group                                     |
| `revokeValue`              | string   | '0'           | Value saved for the revoked cookie group                                      |
| `timeout`                  | number   | 200           | Timeout for auto open on page load (in milliseconds)                          |
| `optionCookieHtml(cookie)` | function |               | Function returning template for single optional cookie group. Function takes one object as parameter which has values for `name` (string), `label` (string), `description` (string) and `accepted` (boolean) and should return string with html. |

Parameters for each `options` object:
| Parameter               | Type      | Default value     | Description                                                                |
| ---------------------   | --------- | ----------------- | -------------------------------------------------------------------------- |
| `name`                  | string    |                   | Name of the cookie group (used for storing the value)                      |
| `label`                 | string    |                   | Label for cookie group which is rendered in window next to the checkbox    |
| `description`           | string    |                   | Description for the cookie group rendered below checkbox and label         |
| `cookieName` (optional) | string    | `ng-cc-` + `name` | Name for storing cookie group consent                                      |
| `accepted` (optional)   | boolean   | false             | Set to true if you want that cookie group to be enabled by default.        |
| `onAccept` (optional)   | function  |                   | Function that gets executed on plugin init if the cookie group is enabled  |
| `onRevoke` (optional)   | function  |                   | Function that gets executed on plugin init if the cookie group is disabled |
