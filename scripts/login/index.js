/*
 * @author  zhulin
 * @date  2014-06-05
 * @modify
 *     从惠惠工程内取出，根据助手收藏夹需求修改
 *     确认未登陆的情况下，需要判断当前页面是从哪里来的
 *         A 收藏夹收藏按钮
 *             a. 未超过20个 成功收藏并显示未登录可能丢失的提示 success_login
 *             b. 超过20个 不收藏 提示未登录只能收藏20个 fail_login
 *         B 其他入口
 *             提示未登录可能丢失 normal_login
 */
 define(function (require, exports, module) {
    'use strict';

    var url = 'http://www.huihui.cn/login?&url=http://zhushou.huihui.cn/myzhushou?doMerge=True';

    var loginForm = require('./login.js');

    /**
     * 遮罩层渲染方法
     * @return {[type]} [description]
     */
    var mask = {
        id : 'loginMask',
        $el : $('#loginMask'),
        show : function () {
            if (this.$el.length !== 0) {
                this.$el.css({
                    position : 'fixed',
                    top : '0',
                    left: '0',
                    height : $(window).height(),
                    width : $(window).width(),
                    'z-index' : 10
                }).show();
                return;
            }
            this.$el = $('<div id="' + this.id + '"></div>');
            this.$el.css({
                position : 'fixed',
                top : '0',
                left: '0',
                height : $(window).height(),
                width : $(window).width(),
                'z-index' : 10
            });
            this.$el.appendTo($('body'));
            this.$el.show();
        },
        hide : function () {
            this.$el.hide();
        },
        remove : function () {
            this.$el.remove();
        }
    };

    var defaultConf = {
        addFave : false, // 是否来自收藏按钮
        success : false, // 是否收藏成功
        maxAmount : 20 , // 默认最多展示数
        targetUrl : encodeURIComponent(url)
    };

    var loginDialog = {

        id : 'loginBox',
        conf : defaultConf,
        tmpl : _.template(require('./login.html')),

        init : function (conf) {
            _.extend(this.conf, conf);
            this.renderBox();
            this.bindEvents();
            // 初始化登陆模块
            loginForm.init();
            this.$box.show();
            var me = this;
            $(window).resize(function () {
                me.reposi();
            });
        },

        renderBox : function () {
            var me = this;
            me.$box = $('<div id="' + this.id + '"></div>');
            mask.show();
            me.$box.html(me.tmpl({
                local : _.extend(me.conf)
            }))
            .hide()
            .appendTo('body')
            .css({
                'position' : 'fixed',
                'top' : ($(window).height() - me.$box.outerHeight()) / 2,
                'left' : ($(window).width() - me.$box.outerWidth()) / 2,
                'z-index': 20,
                'display' : 'block'
            });
        },

        reposi : function () {
            var me = this;
            if (this.$box.length !== 0) {
                mask.show();
                this.$box.css({
                    'top' : ($(window).height() - me.$box.outerHeight()) / 2,
                    'left' : ($(window).width() - me.$box.outerWidth()) / 2
                });
            }
        },

        bindEvents : function () {
            var me = this;
            $('#' + me.id).delegate('.close-btn', 'click', function (e) {
                me.close();
            });
        },

        close : function () {
            $('#' + this.id).remove();
            mask.remove();
        }

    };

    var url = 'http://www.huihui.cn/login?&url=http://zhushou.huihui.cn/myzhushou?doMerge=True';

    var loginInit = function () {
        if (window.youdao !== undefined) {
            loginDialog.init({
                addFave : youdao.isAddSuc === '' ? false : true,
                success : youdao.isAddSuc === 'true' ? true : false,
                maxAmount : youdao.maxAmount,
                targetUrl : encodeURIComponent(url)
            });
        }
    };


    module.exports = loginInit;

 });