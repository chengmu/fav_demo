define(function (require, exports, module) {

    var utils = require('./utils');
    var Paging = require('./paging');

    var BOTTOM_MARGIN = 200;

    var View = Backbone.View.extend({

        tagName: 'div',

        className: 'results-wraper',

        events : {
            'click .retry' : 'retry'
        },

        getKey: function () {
            return utils.getKey(this.iname[0], this.iname[1]);
        },

        initialize: function(router) {
            this.isFirstRender = false;
            this.router = router;
            this.paging = new Paging(router);
             _.bindAll(this, '_checkIfReachBottom');
            $(window).scroll(this._checkIfReachBottom);
            $.isFunction(this.init) && this.init();

        },

        // 把当前 view 插入到页面中。第一次调用 view.render 时运行
        // 延迟的原因是，Router 和 Tab 还没准备好
        _render: function () {
            this.isFirstRender = true;
            var key = this.router.getKey();
            var ctab = this.router.getTab(key);

            this.$el.html(this.template());

            var content = $('#' + ctab.contentId);
            content.empty().append(this.$el);

            this.paging.setElement(this.$el.find('div.paging'));

        },

        render: function() {
            !this.isFirstRender && this._render();
            this._counts = 0;
            var page = this.router.get('page');
            var self = this;
            this._showLoading();
            this.ds.getData({
                page: page,
                filter : self._inFilterMode ? self.filter : undefined
            }, function (json) {
                if (json.total === 0) {
                    self._showEmpty();
                    return;
                }
                self.paging.render(json.total, page);
                self._clearList();
                self.renderList(json, self.ViewItem);
                if (!self._inFilterMode) {
                    self._dontLoad = false;
                }
            });
            this._hideLoading();
            return this;
        },

        _checkIfReachBottom : function () {
            if (($(window).height() + $(window).scrollTop()) + BOTTOM_MARGIN < $(document).height()) return;
            this.append();
        },

        _counts : 0, // 当前页目前已经加载的数目
        _dontLoad : true, // 是否不再触发append；如果是过滤模式的话，不需要再触发
        _inAppending : false, // 是否正在加载更多；避免多次触发
        append : function () {
            if (this._dontLoad || this._counts >= 20 || this._inAppending) return;
            this._inAppending = true;
            var page = this.router.get('page');
            var self = this;
            this._showLoading();
            this.ds.getData({
                page : page,
                counts : self._counts
            }, function (json) {
                self.renderList(json, self.ViewItem);
                self._inAppending = false;
                self._hideLoading();
            });
        },

        _listCache: [],
        renderList: function (json, view) {
            var self = this;
            if (json.error) {
                this._hideLoading();
                this._showOffline();
                this._dontLoad = true;
                return;
            }
            var list = this.$el.find('div.results div.bd ul');
            _.each(json, function (model) {
                var item = new view({ds : self.ds, model : model});
                self._listCache.push(item);
                list.append(item.render().$el);
            });
            self._counts = self._counts + 5;
        },

        retry : function () {
            this._hideOffline();
            if (this._counts === 0) {
                this.render();
            } else {
                this.append();
            }
        },

        _clearList: function () {
            _.each(this._listCache, function (view) {
                view.remove();
            });
        },

        _showLoading: function () {
            this.$el.find('div.results div.ft div.loading').show();
        },

        _hideLoading: function () {
            this.$el.find('div.results div.ft div.loading').hide();
        },

        _showOffline: function () {
            this.$el.find('div.results div.ft div.offline').show();
        },

        _hideOffline: function () {
            this.$el.find('div.results div.ft div.offline').hide();
        },

        _showEmpty : function () {
            this.$el.find('div.results div.ft div.empty').show();
        },

        _hideEmpty : function () {
            this.$el.find('div.results div.ft div.empty').hide();
        }
    });

    return View;
});