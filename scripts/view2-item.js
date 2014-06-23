define(function (require, exports, module) {

    var template = require('../templates/view2-item.html');

    var View2Item = Backbone.View.extend({

        tagName: 'div',

        className: 'view2-item',

        template: _.template(template),

        events: {},

        initialize: function () {},

        render: function (model) {
            this.$el.html(this.template(model));
            return this;
        }

    });

    return View2Item;
});