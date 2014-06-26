/**
 * @author liangxiao
 * @version [v1.0]
 * @description Cookie操作
 */

/*jslint browser: true, vars: true, nomen: true, indent: 4, maxlen: 80, plusplus: true, sloppy: true*/
/*global define: true */
define(function (require, exports, module) {
    /**
    * 设置cookie
    * @constructor
    * @type {Function} setCookie
    * @params {String} key
    * @params {String} val
    * @params {Number} days
    */
    var setCookie = function (key, val, days) {
        var exdate;
        var _cookie = key + "=" + window.escape(val) + ';path=/';
        var domain = window.location.host.split(':')[0];
        domain = '.' + domain;
        _cookie += ';domain=' + domain;
        if (!!parseInt(days, 10)) {
            exdate = new Date();
            exdate.setDate(exdate.getDate() + days);
            _cookie += ';expires=' + exdate.toGMTString();
        }
        document.cookie = _cookie;
    };
    /**
    * Cookie操作
    * @type {Object} Cookie
    */
    var Cookie = {
        /**
        * 添加cookie
        * @constructor
        * @type {Function} setCookie
        * @params {String} key
        * @params {String} val
        * @params {Number} days
        */
        'add': function (key, val, days) {
            if (this.get(key)) {
                throw 'this cookie is already exsit!';
            }
            setCookie(key, val, days);
        },
        /**
        * 清空cookie
        * @constructor
        * @type {Function} clear
        */
        'clear': function () {
            var key;
            var cookies = this.getAll();
            for (key in cookies) {
                if (cookies.hasOwnProperty(key) && key !== '') {
                    this.del(key);
                }
            }
        },
        /**
        * 删除cookie
        * @constructor
        * @type {Function} del
        * @params {String} key
        */
        'del': function (key) {
            if (!this.get(key)) {
                throw 'this cookie is undefined!';
            }
            setCookie(key, 0, -1);
        },
        /**
        * 更新cookie
        * @constructor
        * @type {Function} update
        * @params {String} key
        * @params {String} val
        * @params {Number} days
        */
        'update': function (key, val, days) {
            if (!this.get(key)) {
                throw 'this cookie is undefined!';
            }
            setCookie(key, val, days);
        },
        /**
        * 获取cookie
        * @constructor
        * @type {Function} get
        * @params {String} key
        */
        'get': function (key) {
            return this.getAll()[key];
        },
        /**
        * 以json格式获取全部cookie
        * @constructor
        * @type {Function} getAll
        */
        'getAll': function () {
            var arr = document.cookie.split(';');
            var ck = {};
            var tem;
            var key;
            var i;
            var len;
            for (i = 0, len = arr.length; i < len; i++) {
                tem = arr[i].split('=');
                key = tem[0].replace(/^\s*|\s*$/g, '');
                if (tem[1]) {
                    ck[key] = tem[1];
                }
            }
            return ck;
        }
    };
    return Cookie;
});