define(function (require, exports, module) {

    var utils = require('./utils');
    var Paging = require('./paging');

    var View = Backbone.View.extend({

        tagName: 'div',

        className: 'results-wraper',

        getKey: function () {
            return utils.getKey(this.iname[0], this.iname[1]);
        },

        initialize: function(router) {
            this.isFirstRender = false;
            this.router = router;
            this.paging = new Paging(router);
            console.log('view init finish.', this.getKey());
             _.bindAll(this, 'append');
            $(window).scroll(this.append);

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
                filter : self._inFilterMode ? self.filter : null
            }, function (json) {
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

        _counts : 0,
        _dontLoad : true,
        _inAppending : false,
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

        renderList: function (json, view) {
            var self = this;
            var list = this.$el.find('div.results div.bd ul');
            _.each(json, function (model) {
                var item = new view({ds : self.ds, model : model});
                self._listCache.push(item);
                list.append(item.render().$el);
            });
            self._counts = self._counts + 5;
        },

        _listCache: [],

        _clearList: function () {
            _.each(this._listCache, function (view) {
                view.remove();
            });
        },

        _showLoading: function () {
            this.$el.find('div.results div.ft').show();
        },

        _hideLoading: function () {
            this.$el.find('div.results div.ft').hide();
        },
    });

    return View;
});