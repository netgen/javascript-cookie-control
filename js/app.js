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
      optionCookieHtml: cookie => `<li>
          <input type="checkbox" class="ng-cc-optional-checkbox" id="ng-cc-${cookie.name}" data-name="${cookie.name}" ${cookie.accepted ? 'checked' : ''} />
          <label for="ng-cc-${cookie.name}">
            <i class="ng-cc-checkbox-icon">
              <span></span>
            </i>${cookie.label}
          </label>
          <p>${cookie.description}</p>
        </li>`,
    }, config.options);
    this.opened = false;
    this.acceptedCookies = getCookie('ng-cc-accepted') === 'accepted';
    this.optionalCookies = {};
    this.optionalCookiesByName = [];

    config.optionalCookies.forEach((ck) => {
      /* get saved value from cookies */
      const savedCookie = getCookie(ck.cookieName || `ng-cc-${ck.name}`);
      const cookie = {
        ...ck,
        /* set accepted value according to saved or default value */
        accepted: savedCookie === this.options.revokeValue ? false : savedCookie === this.options.acceptValue || ck.accepted,
      };
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
    document.querySelectorAll('.ng-cc-toggle').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        return this.opened ? this.close() : this.open();
      });
    });

    /* close cookie window */
    document.querySelectorAll('.ng-cc-close').forEach((el) => {
      el.addEventListener('click', this.close.bind(this));
    });

    /* open cookie window */
    document.querySelectorAll('.js-open-ng-cc').forEach((el) => {
      el.addEventListener('click', this.open.bind(this));
    });

    /* accept cookies */
    this.el.querySelector('#ng-cc-accept').addEventListener('click', this.accept.bind(this));

    /* turn on/off cookie group */
    this.el.querySelectorAll('.ng-cc-optional-checkbox').forEach((checkbox) => {
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
    setCookie(
      this.optionalCookies[e.target.dataset.name].cookieName || `ng-cc-${e.target.dataset.name}`,
      e.target.checked ? this.options.acceptValue : this.options.revokeValue,
      this.options.lifetime
    );

    /* call onChange function if defined */
    this.options.onChange && this.options.onChange(e, this);
  }

  accept(e) {
    e && e.preventDefault();
    setCookie('ng-cc-accepted', 'accepted', this.options.lifetime);
    this.close();

    /* call onAccept function if defined */
    this.options.onAccept && this.options.onAccept(this);
  }

  set(option, value) {
    this.options[option] = value;
  }
}
