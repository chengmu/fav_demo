define(function (require, exports, module) {

    var Pop = require('./popout/pop.js');
    var template = require('../templates/fav-item.html');
    var dr = require('./depriceReminder.js');

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

        /**
         * 设置降价提醒目标价格
         * @param {[type]} e [description]
         */
        setPrice : function (e) {
            var me = this;
            var url = me.model.url;
            dr.getExpectPrice(url, function (res) {
                console.log('获取目标价格, url:', url, '，返回：', res);
                var price = me.model.price;
                var expectPrice = res.success && res.expectPrice !== '0.0' ? res.expectPrice : me.model.curPrice;
                var content = _.template(tmplString, {
                    price : expectPrice
                });
                var pop = new Pop({
                    data : {
                        'title' : '修改降价提醒目标价',
                        'content' : content
                    },
                    confirmHandle : function () {
                        var price = this.$el.find('input').val();
                        if (num_reg.test(price)) {
                            dr.setExpectPrice(url, price, function (res) {
                                console.log('设置成功！', res);
                            });
                            return true;
                        } else {
                            this.$el.find('.error').show();
                            return false;
                        }
                    }
                });

            });
        }


    });

    var num_reg = /^\d+(\.[0-9]{0,2})?$/;
    var tmplString = [
        '<div id="modifyExpectPrice">',
            '<label for="expectPrice">目标价格：</label>',
            '<input type="text" id="expectPrice" name="expectPrice" value="' + '<%=price%>' + '"/>',
            '<p class="error">*请填写有效数值</p>',
        '</div>'
        ].join('');



    return Fav;
});