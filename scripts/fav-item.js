define(function (require, exports, module) {

    var Pop = require('./popout/pop.js');
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
            var me = this;
            var content = _.template(tmplString, {
                price : me.expectPrice || 0
            });
            var pop = new Pop({
                data : {
                    'title' : '修改降价提醒目标价',
                    'content' : content
                }
            });
        }


    });


    var tmplString = [
        '<div id="modifyExpectPrice">',
            '<label for="expectPrice">目标价格：</label>',
            '<input type="text" id="expectPrice" name="expectPrice" value="' + '<%=price%>' + '"/>',
            '<p class="error">*请填写有效数值</p>',
        '</div>'
        ].join('');



    return Fav;
});