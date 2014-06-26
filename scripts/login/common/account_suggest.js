/**
 * 帐号输入框的email suggest
 * 用法：   dao.ui.suggest.AccountSuggest.init(jqObj, 'e1'|'e2');
 */
define(function(require, exports, module) {
    var emailList = {
        'e1': ['163.com', '126.com', 'yeah.net', 'vip.163.com', 'vip.126.com', 'popo.163.com', '188.com', 'qq.com', 'yahoo.com', 'yahoo.com.cn', 'gmail.com', 'hotmail.com', 'sina.com', 'sina.cn', 'sohu.com', 'netease.com'],
        'e2': ['qq.com', 'gmail.com', 'hotmail.com', 'sina.cn', 'sohu.com'],
        'e3':['163.com', '126.com', 'yeah.net', 'vip.163.com', 'vip.126.com', 'popo.163.com', '188.com', 'qq.com', 'yahoo.com', 'yahoo.com.cn', 'sina.com']
    };

    var defParams = {
        obj: null,
        password: null,
        elist: emailList.e3,
        appendTo: document.body
    };

    var AccountSuggest = function(conf) {
        var obj = conf.obj;
        var password = conf.password;

        if (!!!obj || obj.length === 0) {
            throw 'the params conf is error';
        }

        obj.attr('autocomplete', 'off');
        obj.parents('form').attr('autocomplete', 'off');

        if (!!!password || password.length === 0) {
            throw 'the params conf is error';
        }

        this.conf = $.extend({}, defParams, conf);
        this.init();
    };

    AccountSuggest.prototype = {
        init: function(){
            this._createSuggestList();
            this._positon();
            this._initEvent();
        },
        _createSuggestList: function(){
            this.suglst = $('<ul class="account_suggest_ctn"><li class="title">请选择或继续输入...</li></ul>');
            var liArr = [];
            for (var i = 0, l = this.conf.elist.length; i < l; i++) {
                liArr[liArr.length] = '<li>@' + this.conf.elist[i] + '</li>';
            }
            this.suglst.append(liArr.join(''));

            var parent = $(this.conf.appendTo);
            if (parent[0] !== document.body && parent.css('position') === 'static') {
                parent.css('position', 'relative');
            }

            $(this.conf.appendTo).append(this.suglst);
        },
        _positon: function(){
            var p = this.conf.obj.offset();
            var parent = $(this.conf.appendTo);
            var parentP = parent.offset();
            var pbl = 0;
            var pbt = 0;

            if (parent[0] !== document.body) {
                pbl = parseInt(parent.css('border-left-width'));
                pbt = parseInt(parent.css('border-top-width'));
                pbl = isNaN(pbl) ? 0 : pbl;
                pbt = isNaN(pbt) ? 0 : pbt;
            }

            this.suglst.css({
                // 'left': p.left - parentP.left - pbl,
                // 'top': p.top - parentP.top + parseInt(this.conf.obj.outerHeight()) - 1 - pbt,
                // 2014-06-18
                // 这里不知为何计算有误，临时指定具体数值 等以后fix
                'left': 88,
                'top': 42,
                'width': (parseInt(this.conf.obj.outerWidth()) - 2)
            });
        },
        _initEvent: function(){
            var appVers = navigator.appVersion;
            var keypress = appVers.match(/Konqueror|Safari|KHTML/) ? 'keydown' : "keypress";

            var _self = this;
            _self.conf.obj.bind(keypress, function(event){
                var _obj = $(this);
                var keyCode = event.keyCode;
                if (keyCode == 13) {
                    // XXX: 屏蔽enter
                    event.stopPropagation();
                    event.preventDefault();

                    //if ($.trim(_obj.val()).length > 0) {
                    //    _self.conf.password[0].focus();
                    //}
                    return true;
                } else {
                    return true;
                }
            });
            this.conf.obj.keyup(this.bind(this, this._keyupHandler));
            this.conf.obj.blur(this.bind(this, this._blurHandler));
            this.suglst.find('li').mouseover(this.bind(this, this._mouseoverHandler));
            this.suglst.find('li').mouseout(this.bind(this, this._mouseoutHandler));
        },
        _setContent: function(v){
            var lis = this.suglst.find('li'), elt = this.conf.elist;
            for (var i = 0, l = elt.length; i < l; i++) {
                lis[i + 1].innerHTML = v + '@' + elt[i];
            }
        },
        _keyupHandler: function(event){
            event.stopPropagation();
            event.preventDefault();
            var v, d, reg = null, count = 0, _keyCode = event.which;

            if (_keyCode === 40) { // 下键
                return this._downKeyHandler();
            } else if (_keyCode === 38) { // 上键
                return this._upKeyHandler();
            } else if (_keyCode === 13) { // 回车键
                return this._enterKeyHandler();
            } else {
                v = this.conf.obj.val();
                v = $.trim(v);
                if (v.length == 0) {
                    // 如果没有有效的输入，则Suggeset关闭
                    this.suglst.css("display", "none");
                    return;
                }

                d = v.split('@');
                if (d.length === 1) {
                    this._setContent(d[0]);
                    this.suglst.find('li').show();
                    // this.suglst.show();
                    this.suglst.css("display", "block");
                } else {
                    reg = new RegExp('^' + d[1], 'i');
                    for (var i = 0, l = this.conf.elist.length; i < l; i++) {
                        if (!reg.test(this.conf.elist[i])) {
                            this.suglst.find('li').eq(i + 1).hide().removeClass('on');
                            count += 1;
                        } else {
                            this.suglst.find('li').eq(i + 1).show();
                        }
                    }
                    if (count < this.conf.elist.length) {
                        this._setContent(d[0]);
                        // this.suglst.show();
                        this.suglst.css("display", "block");
                    } else {
                        this.suglst.hide();
                        return false;
                    }
                }
            }
        },
        _blurHandler: function(event){
            event.stopPropagation();
            var v = this.suglst.find('li.on');
            var val = $.trim(this.conf.obj.val());
            var defVal = this.conf.obj.attr('def-data');

            // empty
            if (val === '' || val === defVal) {
                this.conf.password.focus();
                return;
            }
            // not match
            if (this.suglst.css("display") === "none") {
                this.conf.password.focus();
                return;
            }
            // select item
            if (v.length !== 0) {
                this.conf.obj.val(v.html()).change();
                this.conf.password.focus();
            } else {
                v = this.suglst.find('li:visible');
                if (v.length < 2) {
                    return;
                }
                v = v.eq(1);
                this.conf.obj.val(v.html()).change();
                this.conf.password.focus();
            }
            this.suglst.hide();
        },
        _downKeyHandler: function(){

            if (this.suglst.css('display') === 'none')
                return false;
            var curLi = this.suglst.find('li.on'), nextLi;
            if (curLi.length === 0) {
                curLi = this.suglst.find('li:visible').eq(1);
                curLi.addClass('on');
            } else {
                nextLi = curLi.next('li');
                while (nextLi.length !== 0) {
                    if (nextLi.css('display') === 'none') {
                        nextLi = nextLi.next('li');
                    } else {
                        break;
                    }
                }
                if (nextLi.length === 0) {
                    nextLi = this.suglst.find('li:visible').eq(1);
                }
                curLi.removeClass('on');
                nextLi.addClass('on');
            }
            return false;
        },
        _upKeyHandler: function(){
            if (this.suglst.css('display') === 'none')
                return false;
            var curLi = this.suglst.find('li.on'), prevLi;
            if (curLi.length === 0) {
                curLi = this.suglst.find('li:visible').last();
                curLi.addClass('on');
            } else {
                prevLi = curLi.prev('li');
                while (!prevLi.hasClass('title')) {
                    if (prevLi.css('display') === 'none') {
                        prevLi = prevLi.prev('li');
                    } else {
                        break;
                    }
                }
                if (prevLi.hasClass('title')) {
                    prevLi = this.suglst.find('li:visible').last();
                }
                curLi.removeClass('on');
                prevLi.addClass('on');
            }
            return false;
        },
        _enterKeyHandler: function(){
            var v = this.suglst.find('li.on');

            if (v.length === 0) {
                return;
            }

            this.conf.obj.val(v.html());
            // 关闭suggest
            this.suglst.hide().find('li.on').removeClass('on');
            this.conf.password.focus();
        },
        _mouseoutHandler: function(event){
            //event.stopPropagation();
            var t = $(event.target);
            if (t.hasClass('title'))
                return false;
            t.removeClass('on');
            return false;
        },
        _mouseoverHandler: function(event){
            //event.stopPropagation();
            var t = $(event.target);
            if (t.hasClass('title'))
                return false;
            this.suglst.find('li.on').removeClass('on');
            t.addClass('on');
            return false;
        },
        bind: function(obj, func){
            return function(){
                func.apply(obj, arguments);
            };
        }
    };

    return AccountSuggest
});
