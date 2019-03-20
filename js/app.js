import { setCookie, getCookie } from './helpers';

export default class CookieControl {
  constructor(config = { optionalCookies: [] }, id = 'ng-cc') {
    this.el = document.getElementById(id);
    this.options = Object.assign({}, {
      open: true,
      lifetime: 365,
      acceptValue: '1',
      revokeValue: '0',
      timeout: 200,
      domain: null,
      optionCookieHtml: cookie => `<li>
          <input type="checkbox" class="ng-cc-optional-checkbox" id="ng-cc-${cookie.name}" data-name="${cookie.name}" ${cookie.accepted ? 'checked' : ''} />
          <label for="ng-cc-${cookie.name}">
            <i class="ng-cc-checkbox-icon">
              <span></span>
            </i>${cookie.label ? cookie.label : ''}
          </label>
          ${cookie.description ? `<p>${cookie.description}</p>` : ''}
        </li>`,
    }, config.options);
    this.opened = false;
    this.acceptedCookies = getCookie('ng-cc-accepted') === 'accepted';
    this.optionalCookies = {};
    this.optionalCookiesByName = [];

    config.optionalCookies.forEach((ck) => {
      const cookieName = ck.cookieName || `ng-cc-${ck.name}`;
      /* get saved value from cookies */
      const savedCookie = getCookie(cookieName);
      const cookie = {
        ...ck,
        cookieName,
        /* set accepted value according to saved or default value */
        accepted: savedCookie === this.options.revokeValue ? false : savedCookie === this.options.acceptValue || ck.accepted,
      };

      /* initial save to cookies if default accepted and not saved */
      !savedCookie && cookie.accepted && setCookie(cookie.cookieName, this.options.acceptValue, this.options.lifetime, this.options.domain);

      this.optionalCookies[cookie.name] = cookie;
      this.optionalCookiesByName.push(cookie.name);

      /* call onAccept or onRevoke functions */
      cookie.accepted ? cookie.onAccept && cookie.onAccept() : cookie.onRevoke && cookie.onRevoke();
    });
  }

  init() {
    /* initialize plugin */
    if (!this.el) return;
    this.renderOptional();
    this.setupEvents();
    !this.acceptedCookies && this.options.open && window.setTimeout(this.open.bind(this), this.options.timeout);
  }

  setupEvents() {
    /* toggle show/hide cookie window */
    [...document.getElementsByClassName('ng-cc-toggle')].forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        return this.opened ? this.close() : this.open();
      });
    });

    /* close cookie window */
    [...document.getElementsByClassName('ng-cc-close')].forEach((el) => {
      el.addEventListener('click', this.close.bind(this));
    });

    /* open cookie window */
    [...document.getElementsByClassName('js-open-ng-cc')].forEach((el) => {
      el.addEventListener('click', this.open.bind(this));
    });

    /* accept cookies */
    document.getElementById('ng-cc-accept').addEventListener('click', this.accept.bind(this));

    /* turn on/off cookie group */
    [...this.el.getElementsByClassName('ng-cc-optional-checkbox')].forEach((checkbox) => {
      checkbox.addEventListener('change', this.toggleCookie.bind(this));
    });
  }

  open(e) {
    e && e.preventDefault();
    this.el.setAttribute('open', '');
    this.opened = true;
  }

  close(e) {
    e && e.preventDefault();
    this.el.removeAttribute('open');
    this.opened = false;
  }

  renderOptional() {
    /* render optional cookie groups to cookie window */
    let optionalHtml = '';
    this.optionalCookiesByName.forEach((cookieName) => {
      const cookie = this.optionalCookies[cookieName];
      optionalHtml += this.options.optionCookieHtml(cookie);
    });
    this.el.querySelector('.ng-cc-optional-list').innerHTML += optionalHtml;
  }

  toggleCookie(e) {
    /* turn on/off cookie group and save to cookie */
    this.optionalCookies[e.target.dataset.name].accepted = e.target.checked;
    this.saveCookie(this.optionalCookies[e.target.dataset.name]);

    /* call onChange function if defined */
    this.options.onChange && this.options.onChange(e, this);
  }

  saveAll() {
    this.optionalCookiesByName.forEach(name => this.saveCookie(this.optionalCookies[name]));
  }

  saveCookie(cookie) {
    setCookie(cookie.cookieName, cookie.accepted ? this.options.acceptValue : this.options.revokeValue, this.options.lifetime, this.options.domain);
  }

  accept(e) {
    e && e.preventDefault();
    setCookie('ng-cc-accepted', 'accepted', this.options.lifetime, this.options.domain);
    this.saveAll();
    this.close();

    /* call onAccept function if defined */
    this.options.onAccept && this.options.onAccept(this);
  }

  set(option, value) {
    this.options[option] = value;
  }
}
