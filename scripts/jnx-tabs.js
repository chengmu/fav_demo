// 文档中存在如下格式的 html，将被视为一个 tab，直接引入该文件，即可完成初始化
// -----------------------------------------------------------------------------
// <div tab-wraper data-name="outer">
//     <div tab-navs>
//         <button tab-nav data-name="nav1">nav1</button>
//         <button tab-nav data-name="nav2">nav2</button>
//         <button tab-nav data-name="nav3">nav3</button>
//     </div>
//     <div tab-contents>
//         <div tab-content>nav1</div>
//         <div tab-content>nav2</div>
//         <div tab-content>nav3</div>
//     </div>
// </div>
// -----------------------------------------------------------------------------
// 引入和使用方式例如：
//      var tabs = require('./jnx-tabs');
//      tabs.set('router', router); // 设置路由
//      // 监控所有 tab 的切换动作
//      tabs.on('tabChange', function (tabName, navName, navId, contentId) {
//          console.log('tab change: ', arguments);
//      });
//      // 监控指定 tab 的切换动作
//      tabs.on('outer:nav2', function (tabName, navName, navId, contentId) {
//          console.log('outer:nav2', arguments);
//      });
// -----------------------------------------------------------------------------
// 相关说明：
// 1、支持浏览器路由导航（前进/后退）
// 2、页面中可同时存在多个，非嵌套使用的情况下，较完善，可放心使用
// 3、可以嵌套使用（未充分测试），基本没问题，后续改进（2014-05-31）
// 4、关于 Router 和 History 的技术细节，请参考 BackboneJS 官方文档
//
// 依赖的第三方库：jQuery，BackboneJS，UnderscoreJS
//
define(function (require, exports, module) {

    var utils = require('./utils');

    var DEFAULT_CONFIG = {
        'selector': {
            'wraper' : '[tab-wraper]',
            'navs': '[tab-navs]',
            'nav': '[tab-nav]',
            'contents': '[tab-contents]',
            'content': '[tab-content]'
        },
        // 标识当前正在显示的tab，包括 nav 和 content 部分
        'active': 'active',
        // 当前选项卡的状态
        // 可以通过 tabs.get('status') 获得
        'status': {tabName: '', navName: '', navId: '', contentId: ''}
    };

    var Tabs = function () {
        this.setting = _.extend({}, DEFAULT_CONFIG);
        this.initialize.apply(this, arguments);
    };

    _.extend(Tabs.prototype, Backbone.Events, {

        _tabCaches: {},

        getTab: function (tab, nav) {
            var key = nav ? utils.getKey(tab, nav) : tab;
            return this._tabCaches[key];
        },

        initialize: function () {
            var self = this;
            var active = this.get('active');
            var S = this.get('selector');
            var initWraper = function (wraper) {
                var wname = wraper.data('name');
                var _navs = wraper.children(S.navs);
                var navs = _navs.children(S.nav);
                var _contents = wraper.children(S.contents);
                var contents = _contents.children(S.content);
                var hasActiveNav = navs.is('.' + active);
                var createID = (function () {
                    var p = 0;
                    return function (str) {
                        return str + '_' + (p++) + '_' + (+new Date)
                    };
                })();
                navs.each(function (idx, nav) {
                    nav = $(nav);
                    var vname = nav.data('name');
                    var content = $(contents.get(idx));
                    var nav_id = createID('nav');
                    var content_id = createID('content');
                    nav.attr('id', nav_id);
                    nav.attr('data-contentid', content_id);
                    content.attr('id', content_id);
                    // 默认显示第一个 tab
                    // if (idx === 0 && !hasActiveNav) {
                    //     wraper.attr('data-navid', nav_id);
                    //     nav.addClass(active);
                    //     content.addClass(active);
                    // }
                    if (hasActiveNav && nav.hasClass(active)) {
                        wraper.attr('data-navid', nav_id);
                    }

                    self._tabCaches[utils.getKey(wname, vname)] = {
                        'navId': nav_id,
                        'contentId': content_id
                    };
                });

                _navs.on('click', S.nav, function (evt) {
                    var nav = $(this);
                    if (nav.hasClass(active)) return;

                    var vname = nav.data('name');
                    var nav_id = nav.attr('id');
                    var content_id = nav.data('contentid');
                    var content = $('#' + content_id);
                    navs.removeClass(active);
                    contents.removeClass(active);
                    nav.addClass(active);
                    content.addClass(active);

                    wraper.attr('data-navid', nav_id);
                    self._setStatus(wname, vname, nav_id, content_id);

                    self._tabChange(wname, vname, nav_id, content_id);
                });
            };

            $(S.wraper).each(function (idx, wraper) {
                initWraper.apply(self, [$(wraper)]);
            });
            console.log('tab init finish. ', self._tabCaches);
        },

        // {tabName: '', navName: '', navId: '', contentId: ''}
        _setStatus: function (_tabName, _navName, _navId, _contentId) {
            var status = this.get('status');
            status['tabName'] = _tabName;
            status['navName'] = _navName;
            status['navId'] = _navId;
            status['contentId'] = _contentId;
        },

        // 跳转到指定的选项卡页
        // 可以通过指定第三个参数来确定是否触发 tabChange 事件
        jumpTo: function (_tab, _nav, noTrigger) {
            var S = this.get('selector');
            var active = this.get('active');

            var wraper = $('[data-name="' + _tab + '"]');
            var navs = wraper.children(S.navs);
            var nav = navs.find('[data-name="' + _nav + '"]');
            var nav_id = nav.attr('id');
            var content_id = nav.data('contentid');
            var content = $('#' + content_id);
            var contents = content.closest(S.contents);

            wraper.attr('data-navid', nav_id);
            this._setStatus(_tab, _nav, nav_id, content_id);

            navs.find(S.nav).removeClass(active);
            contents.find(S.content).removeClass(active);
            nav.addClass(active);
            content.addClass(active);

            !noTrigger && this._tabChange(_tab, _nav, nav_id, content_id);
        },

        /**
         * tab 切换时触发
         * @param  {[type]} _tab
         *         <div tab-wraper data-name="{_tab}">
         * @param  {[type]} _nav
         *         <div tab-nav data-name="_nav">
         * @param  {[type]} _nid
         *         <div tab-nav id="{_nid}">
         * @param  {[type]} _cid
         *         <div tab-content id="{_cid}">
         * @return {[type]}      [description]
         */
        _tabChange: function (_tab, _nav, _nid, _cid) {
            this.get('router').trigger('tabChange', _tab, _nav, _nid, _cid);
        },

        set: function (name, value) {
            this.setting[name] = value;
            return this;
        },

        get: function (name) {
            return this.setting[name];
        }

    });

    return new Tabs;
});