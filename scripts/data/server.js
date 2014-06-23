/**
 * 服务端数据方法
 * @author  zhulin
 * @date 2014-06-10
 * 获取和修改服务端数据的方法
 */
define(function (require, exports, module) {
    'use strict';

    var md5 = require('../code').md5;

    var defaultOptions = {
        // ?start=0&length=10
        BASE_URL : 'http://zhushou.huihui.cn/api/myzhushou/collection/',
        GET_API : 'list',
        DEL_API : 'delurls',
        keys : ['login', 'jifenUrl', 'used'],

        filter : function (data) {
            // 数据处理
            return data;
        }
    };

    var Server = function (ops) {
        ops = ops || {};
        this.ops = _.extend(ops, defaultOptions);
        this.initialize.apply(this, arguments);
        return this;
    };

    /**
     * 合并参数
     */
    var combParams = function (base, api, params) {
        var url = '';
        url = base + api + '?';
        for (var key in params) {
            if (params.hasOwnProperty(key)) {
                url += key + '=' + params[key] + '&';
            }
        }
        return url.slice(0, url.length - 1);
    };

    _.extend(Server.prototype, Backbone.Events, {
        initialize : function () {
            this.firstRequest = true;
        },

        _ajax : function (url, callback) {
            $.ajax({
                url : url,
                dataType : 'json',
                success : function (data) {
                    return $.isFunction(callback) ? callback(data) : null ;
                },
                error : function (err) {
                    return $.isFunction(callback) ? callback(err) : null ;

                }
            });
        },

        _filter : function (rawData) {
            var me = this;
            var data = rawData.list;
            if ($.isFunction(me.ops.filter)) {
                data = me.ops.filter(data);
            }
            var info = {};
            if (me.firstRequest) {
                _.each(me.ops.keys, function (key) {
                    if (rawData.hasOwnProperty(key)) {
                        info[key] = rawData[key];
                    }
                });
            }
            info.size = rawData.allsize || 0;
            return [data, info];
        },

        fetch : function (offset, limits, callback) {
            var me = this;
            var url = combParams(me.ops.BASE_URL, me.ops.GET_API, {
                start : offset,
                length : limits
            });
            me._ajax(url, function (data) {
                var result = me._filter(data);
                result[1].offset = offset;
                result[1].limits = limits;
                return $.isFunction(callback) ? callback.apply(me, result) : null ;
            });
        },

        remove : function (urls, callback) {
            var me = this;
            var url = combParams(me.ops.BASE_URL, me.ops.DEL_API, {
                allmd5 : (_.map(urls, function (url) {
                    return md5(url);
                })).join('|')
            });
            me._ajax(url, function (data) {
                return $.isFunction(callback) ? callback(data) : null;
            });
        }
    });

    module.exports = Server;


});