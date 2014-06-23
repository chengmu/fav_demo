define(function (require, exports, module) {

    var template = require('../templates/fav-item.html');

    var Fav = Backbone.View.extend({

        tagName: 'li',

        className: '',

        template: _.template(template),

        events: {
            'click .delete' : 'deleteItem',
            'click .setting' : 'setPrice'
        },

        initialize: function (conf) {
            _.extend(this, conf);
        },

        render: function (model) {
            if (model === undefined) {
                model = this.model;
            }
            this.$el.html(this.template({
                item : model
            }));
            return this;
        },

        deleteItem : function (e) {
            var self = this;
            this.ds.remove([this.model], function() {
                self.$el.css({
                    'transition' : '.3 opacity',
                    'opacity' : .5
                });
                setTimeout(function() {
                    self.$el.remove();
                }, 300);
            });
        },

        setPrice : function (e) {

        }


    });

    return Fav;
});