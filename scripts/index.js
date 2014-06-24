define(function (require, exports, module) {
    console.log('page start...');
    if (window.ENVIRO_DEBUG) {
        $.ajax = require('./jsonp.js');
    }
    var utils = require('./utils');
    var tabs = require('./jnx-tabs');
    // -------------------------------------------------------------------------
    var Router = Backbone.Router.extend({
        routes: {
            ":tab/:nav/:page": "redirect"
        },
        views: {},
        _status: {},
        set: function (key, val) { this._status[key] = val; return this;},
        get: function (key, defVal) { return this._status[key] || defVal},
        initialize: function () {
            this.on('tabChange', _.bind(this.tabChange, this));
            this.on('pageChange', _.bind(this.pageChange, this));
            console.log('router init finish.');
        },
        getKey: function (tab, nav) {
            tab || (tab = this.get('tab'));
            nav || (nav = this.get('nav'));
            return utils.getKey(tab, nav);
        },
        tabChange: function (tab, nav, navId, contentId) {
            this.set('tab', tab).set('nav', nav)
                .set('navId', navId).set('contentId', contentId);
            var key = this.getKey();
            this.set('page', this.get(key) || 1);
            this._navigate();
        },
        pageChange: function (page) {
            this.set('page', page).set(this.getKey(), page);
            $(document).scrollTop(0);
            this._navigate();
        },
        _navigate: function () {
            var tab  = this.get('tab');
            var nav  = this.get('nav');
            var page = this.get('page');
            this.navigate([tab, nav, page].join('/'), {trigger: false});
            this.renderView();
        },
        redirect: function (tab, nav, page) {
            console.log('router redirect to ... ', arguments);
            page = page - 0;
            this.set('tab', tab).set('nav', nav).set('page', page)
                .set(this.getKey(), page);

            tabs.jumpTo(this.get('tab'), this.get('nav'), true);
            this.renderView();
        },
        renderView: function () {
            var view = this.views[this.getKey()];
            view && view.render();
        },
        mountView: function (view) {
            this.views[view.getKey()] = view;
        },
        getTab: function (tab, nav) {
            return tabs.getTab(tab, nav);
        }
    });
    // -------------------------------------------------------------------------
    var router = window.router = new Router();

    tabs.set('router', router);
    window.tab=tabs;
    // mount views
    var View1 = require('./fav.js');
    var View2 = require('./view2');
    router.mountView(new View1(router, tabs));
    router.mountView(new View2(router, tabs));

    // -------------------------------------------------------------------------
    var hasHash = Backbone.history.start({
        pushState: false, hashChange: true
    });
    // console.log('>>>>> has hash in current url : ', hasHash);
    // 默认展开的 tab
    if(!hasHash) router.navigate('home/fav/1', {trigger: true});

    require('./hoverHistory.js');

    require('./depriceReminder.js');

});



