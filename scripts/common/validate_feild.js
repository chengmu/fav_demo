/**
* 域验证
* @class ValFeild
*/
define(function(require, exports, module) {
    var tipsSelector = '.prompt-state, .css-module-h-tips1';
    /**
    * static personal class
    * @class Prompt
    */
    var Prompt = {
        /**
        * 显示提示信息
        * @params {Object} $promptsWrap jQueryObject
        */
        show: function($promptsWrap, ikey) {
            var $prompts = $promptsWrap.find(tipsSelector);
            $prompts.filter('[data-ikey=' + ikey + ']').show();
        },
        /**
        * 隐藏提示信息
        * @params {Object} $promptsWrap jQueryObject
        */
        hide: function($promptsWrap, ikey) {
            var $prompts = $promptsWrap.find(tipsSelector);
            $prompts.filter('[data-ikey=' + ikey + ']').hide();
        },
        /**
        * 隐藏全部提示信息
        * @params {Object} $promptsWrap jQueryObject
        */
        hideAll: function($promptsWrap) {
            $promptsWrap.find(tipsSelector).hide();
        },
        /**
        * 执行规则
        * @params {string} rule
        * @params {String} val $elem的值
        */
        exeRule: function(rule, val) {
            ValFeild.rules[rule].lastIndex = 0;
            var chunker = ValFeild.rules[rule];
            if ($.isFunction(chunker)) {
                return chunker(val);
            } else {
                return chunker.exec(val);
            }
        }
    };
    /**
    * Create a new ValFeild
    * @constructor
    * @class Represents a ValFeild
    * @params {Object} $elem jQueryObject
    * @params {String} $elem[data-rules="email,phone"]
    * @params {String} $elem[data-relation="or"]
    * @params {String} $elem[data-required="1"] 1-必填 0-可空
    */
    var ValFeild = function($elem, $promptWrap) {
        this.$elem = $elem;
        if (!$promptWrap) {
            this.$promptWrap = $elem.parent();
        } else {
            this.$promptWrap = $promptWrap;
        }
        this.isPass = false;
        var rules = $elem.data('rules');
        this.rules = rules ? rules.split(',') : [];
        this.relation = $elem.data('relation');
        this.required = $elem.data('required');
        this.config();
    };
    ValFeild.prototype = {
        /**
        * 验证事件绑定
        */
        config: function() {
            var self = this;
            var $elem = self.$elem;
            $elem.bind('blur', function() {
                self.validate();
            });
            $elem.bind('focus', function() {
                Prompt.hideAll(self.$promptWrap);
            });
        },
        hideAll: function() {
            Prompt.hideAll(this.$promptWrap);
        },
        /**
        * 验证，并提示
        */
        validate: function() {
            var re = this.check();
            if (!re.isPass) {
                Prompt.show(this.$promptWrap, re.ikey);
            }
        },
        /**
        * 验证
        */
        check: function() {
            var self = this;
            var $elem = self.$elem;
            var val = $.trim($elem.val());
            var ikey = '';
            var required = self.required === 1;
            var defData = $elem.attr('def-data');
            // required
            if (required) {
                if (val === '' || val === defData) {
                    self.isPass = false;
                }
                ikey = 'invalid-empty';
            } else {
                self.isPass = true;
            }
            // rules
            if (val !== '' && val !== defData) {
                // or
                if (self.relation && self.relation === 'or') {
                    self.isPass = false;
                    for (var i = 0; i < self.rules.length; i++) {
                        if (Prompt.exeRule(self.rules[i], val)) {
                            self.isPass = true;
                            break;
                        }
                    }
                    ikey = 'invalid-' + self.rules[0];
                } else { // and
                    self.isPass = true;
                    for (var i = 0; i < self.rules.length; i++) {
                        if (!Prompt.exeRule(self.rules[i], val)) {
                            self.isPass = false;
                            ikey = 'invalid-' + self.rules[i];
                            break;
                        }
                    }
                }
            }

            return {
                isPass: self.isPass,
                ikey: ikey
            };
        }
    };
    /**
    * static rules
    * 用户自定义规则加上'ur_'前缀
    * ValFeild.rules.ur_len8 = ...
    */
    ValFeild.rules = {
        /**
        * 汉字认证
        */
        'cnChars': /^[\u4e00-\u9fa5]+$/g,
        /**
         * 中英文下划线认证
         */
        'encnChars': /^[\u4e00-\u9fa5A-Za-z0-9_]+$/g,
        /**
        * 整数或者小数，精度两位
        */
        'decimal2': /^\d+(\.\d{1,2})?$/,
        /**
         * 邮箱认证
         */
        'email': /^([a-z0-9_][a-z0-9_.-]*)?[a-z0-9_-]@([a-z0-9-]+\.){0,4}([a-z0-9][a-z0-9-]{0,61})?[a-z0-9]\.[a-z]{2,6}$/i,
        /**
         * 身份证认证
         */
        'ID': /^\d{15}|\d{18}$/g,
        /**
         * 身份证的严格认证
         */
        'IDs': function(val) {
            var IdentityCard = require('./validate_identity.js');
            return IdentityCard(val);
        },
        /**
         * 长度大于等于6认证
         */
        'min6': function(val) {
            return val.length >= 6;
        },
        /**
         * 手机号码认证
         */
        'phone': /^1\d{10}$/g,
        /**
         * 邮编认证
         */
        'postCode': /^[0-9]\d{5}(?!\d)$/g,
        /**
         * QQ号码认证
         */
        'qq': /^[1-9][0-9]{4,}$/g,
        /**
         * 座机号码认证
         */
        'telphone': /^(\d{3}-)?\d{7,8}(-\d{1,6})?$|^(\d{4}-)?\d{7,8}(-\d{1,6})?$/g
    };
    /**
    * 抛出接口
    * @class
    */
    return ValFeild;
});