define(function (require, exports, module) {

    var template = require('../templates/msg.html');
    var View = require('./view');
    var MsgItem = require('./msg-item');
    var ds = require('./data/msg.js');

    var Msg = View.extend({

        // 本 view 的名称，可以理解为 first name 和 last name
        // first name : <div tab-wraper data-name="{first_name}">
        // last  name : <div tab-nav data-name="{last_name}">
        iname: ['home', 'msg'],

        template: _.template(template),

        ds: ds,

        ViewItem: MsgItem,

        events: {},

        init : function () {
            var me = this;
            this.ds.fetch(0, 10, function (res) {
                me.$el.find('.msgNum').text(res.newNum);
                if (res.newNum !== 0) {
                    me.$el.find('.broadcast').show();
                }
            });
        }



    });

    return Msg;
});