define(function (require, exports, module) {

    var template = require('../templates/msg-item.html');

    var View2Item = Backbone.View.extend({

        tagName: 'div',

        className: 'msg-item',

        template: _.template(template),

        events: {},

        initialize: function () {},

        render: function (model) {
            if (model === undefined) {
                model = this.model;
            }
            this.$el.html(this.template({
                item : model
            }));
            return this;
        }

    });

    return View2Item;
});