define(function (require, exports, module) {

    var template = require('../templates/msg-item.html');
    var dr = require('./depriceReminder.js');

    var MsgItem = Backbone.View.extend({

        tagName: 'div',

        className: 'msg-item',

        template: _.template(template),

        events: {
            'click .setting' : 'setPrice'
        },

        initialize: function () {},

        render: function (model) {
            if (model === undefined) {
                model = this.model;
            }
            this.$el.html(this.template({
                item : model
            }));
            return this;
        },

        setPrice : function (e) {
            dr.setPricePop(this.model.url, this.model.curPrice);
        }

    });

    return MsgItem;
});