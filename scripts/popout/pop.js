define(function (require, exports, module) {

    /**
     * 遮罩层渲染方法
     * @return {[type]} [description]
     */
    var mask = {

        $el : $('#mask'),

        show : function () {
            if (this.$el.length === 0) {
                this.$el = $('<div id="mask"></div>');
                this.$el.css({
                    position :'fixed',
                    top : '0',
                    left: '0',
                    height : $(window).height(),
                    width : $(window).width(),
                    'z-index' : 10
                });
                this.$el.appendTo($('body'));
            }
            this.$el.show();
        },

        resize : function () {
            if (this.$el.length === 0) return;
            this.$el.css({
                height : $(window).height(),
                width : $(window).width()
            });
        },

        hide : function () {
            this.$el.hide();
        }
    };

    var Pop = Backbone.View.extend({

        tagName : 'div',
        className : 'popout',
        template : _.template(require('./index.html')),

        events : {
            'click .cancel'  : 'cancelHandle',
            'click .close'   : 'closeHandle',
            'click .confirm' : 'confirmHandle',
            'keydown input'  : 'carriageHandle'
        },

        initialize : function (conf) {
            this.opts = {};
            _.extend(this.opts, conf);
            this.render();
            _.bindAll(this, 'repos');
            $(window).resize(this.repos);
        },

        render : function () {
            var me = this;
            var opts = me.opts;
            me.$el.html(me.template(opts.data));
            mask.show();
            me.$el.hide();
            me.$el.appendTo('body');
            me.$el.css({
                'position' : 'fixed',
                'top' : ($(window).height() - me.$el.outerHeight()) / 2,
                'left' : ($(window).width() - me.$el.outerWidth()) / 2,
                'z-index' : 20
            }).show();
        },

        repos : function () {
            mask.resize();
            var me = this;
            me.$el.css({
                'top' : ($(window).height() - me.$el.outerHeight()) / 2,
                'left' : ($(window).width() - me.$el.outerWidth()) / 2
            });
        },


        carriageHandle : function (e) {
            if (e.keyCode !== 13) return;
            me.$box.find('.confirm').click();
        },

        remove : function () {
            this.$el.remove();
            mask.hide();
        },

        cancelHandle : function () {
            this.remove();
            var handle = this.opts.cancelHandle;
            $.isFunction(handle) && handle();
        },

        closeHandle : function () {
            this.remove();
            var handle = this.opts.closeHandle;
            $.isFunction(handle) && handle();
        },

        confirmHandle : function () {
            this.remove();
            var handle = this.opts.confirmHandle;
            $.isFunction(handle) && handle();

        }

    });


    module.exports = Pop;
});