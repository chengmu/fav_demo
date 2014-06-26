/**
 * @author liangxiao
 * @version [v1.0]
 * @description
 */
define(function (require, exports, module) {
    'use strict';

    var ValFeild = require('./common/validate_feild.js');
    var AccountSuggest = require('./common/account_suggest.js');
    var Cookie = require('./common/cookie.js');
    var LoginForm = {
        init: function () {
            this.selector = {
                container: 'div.login-container',
                userName: 'input[name=username]',
                password: 'input[name=password]',
                skipUrl: 'input[name=url]',
                validateTip: '#loginTiparea',
                validateTipCloseButton: '#loginTiparea a',
                saveLogin: '#savelogin',
                saveLoginTip: '#rememberPsw',
                saveLoginTipCloseButton: '#rememberPsw a'
            };
            this.addEvent();
            // bind suggest
            var $container = $(this.selector.container);
            if ($container.length === 0) {
                return;
            }
            var $userName = $container.find(this.selector.userName);
            var $password = $container.find(this.selector.password);

            var accountSuggest = new AccountSuggest({
                obj: $userName,
                password: $password,
                appendTo: 'div.login-container div.login-tip'
            });

            // enter
            $userName.bind('keydown', function (e) {
                if (e.keyCode === 13) {
                    $password.focus();
                    e.preventDefault();
                }
            });

            // default value
            var pInfo = Cookie.get('P_INFO');
            if (typeof pInfo === 'string'
                    && pInfo.split('|')[0].indexOf('@') > 0) {
                $userName.val(pInfo.split('|')[0]).removeClass('color-gray')
                    .removeClass('c7');
            }
        },
        addEvent: function () {
            // set context
            var key = null;
            for (key in this) {
                if (typeof this[key] === 'function') {
                    this[key] = _.bind(this[key], (this));
                }
            }
            // saveLogin tip
            $(document).delegate(this.selector.saveLogin, {
                'mouseover': this.showsaveLoginTip,
                'mouseout': this.hidesaveLoginTip
            });
            $(document).delegate(this.selector.saveLoginTipCloseButton, 'click',
                this.hidesaveLoginTip);
            // form submit
            $(document).delegate(this.selector.container + ' form', 'submit',
                this.onSubmit);
            // validateTip
            $(document).delegate(this.selector.validateTipCloseButton, 'click',
                this.hideValidateTip);
            $(document).delegate(this.selector.container + ' '
                + this.selector.userName, 'focus', this.hideValidateTip);
            $(document).delegate(this.selector.container + ' '
                + this.selector.password, 'focus', this.hideValidateTip);
        },
        showsaveLoginTip: function () {
            $(this.selector.saveLoginTip).show();
        },
        hidesaveLoginTip: function () {
            $(this.selector.saveLoginTip).hide();
        },
        showValidateTip: function () {
            $(this.selector.validateTip).show();
        },
        hideValidateTip: function () {
            $(this.selector.validateTip).hide();
        },
        /* Event Handle */
        onSubmit: function (e) {
            var $container = $(this.selector.container);
            var $userName = $container.find(this.selector.userName);
            var $password = $container.find(this.selector.password);
            var $skipUrl = $container.find(this.selector.skipUrl);
            var userName = $.trim($userName.val());
            var password = $.trim($password.val());
            var defaultUserName = $userName.attr('def-data');

            if ($.trim($skipUrl.val()) === '') {
                $skipUrl.val(window.location.href);
            }

            if (userName === '' || userName === defaultUserName
                    || !ValFeild.rules.email.test(userName)
                    || !ValFeild.rules.min6(password)) {
                this.showValidateTip();
                e.preventDefault();
                return;
            }
        }
    };

    module.exports = LoginForm;
});
