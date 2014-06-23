define(function (require, exports, module) {

    var utils = require('./utils');
    var DOT_SPACE = '...';

    window.paging = utils.paging;

    var PagingView = Backbone.View.extend({

        events: {
            'click a': 'gotopage'
        },

        initialize: function (router) {
            this.router = router;
        },

        gotopage: function (evt) {
            evt.preventDefault();
            var self = $(evt.target);
            var page = self.data('page');
            // console.log(page, this.router._status);
            this.router.trigger('pageChange', page);
        },

        createTag: function (tag, content, val, className) {
            val || (val = 0);
            className || (className = '');
            var out = '';
            if (tag === 'span') {
                return [
                    '<span class="', className, '">', content, '</span>'
                ].join('');
            }
            return [
                '<a href="javascript:void(', val ,');" class="', className, '"',
                    'data-page="', val, '">', content, '</a>'
            ].join('');
        },

        generatePaging: function (pages) {
            var o = [], p, cp = pages.currentPage;
            if (cp !== pages[0]) o.push(this.createTag('a', '&lt;', cp - 1));
            for (var i = 0, l = pages.length; i < l; i++) {
                var p = pages[i];
                if (p === DOT_SPACE)
                    o.push(this.createTag('span', DOT_SPACE, '', 'pdot'));
                else if (p === cp)
                    o.push(this.createTag('span', p, p, 'current'));
                else
                    o.push(this.createTag('a', p, p));
            }
            if (cp !== pages[pages.length - 1]) {
                o.push(this.createTag('a', '&gt;', cp + 1));
            }
            return o.join('');
        },

        render: function (total, current) {
            this.$el.html(this.generatePaging(utils.paging(total, current)));
            return this;
        }
    });

    return PagingView;
});