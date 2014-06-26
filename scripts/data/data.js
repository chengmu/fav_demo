/**
 * 本地数据管理
 * @author  zhulin
 * @date 2014-06-10
 * 维护本地数据，实质上是一个数组
 * 初始化时获取服务端数据总数，生成同等长度的数组，未和服务端同步的数据使用undeined占位
 * 服务端数据的相关方法放在server.js
 * TODO :
 *     dataFilter 过滤数据，严格数据格式
 *
 */
define(function (require, exports, module) {
    'use strict';

    var Server = require('./server.js');

    var defaultOptions = {
        initCounts : 10
    };

    var Data = function (options) {
        options = options || {};
        this.opt = _.extend(options, defaultOptions);
        this.list = [];
        this.opt.server = this.opt.server || {};
        this.server = new Server(this.opt.server);
        this.initialize.apply(this, arguments);
        return this;
    };

    _.extend(Data.prototype, Backbone.Events, {

        initialize : function () {
            // 启动时获取一定数目的数据
            var me = this;
            me.server.fetch(0, me.opt.initCounts, function (data, info) {
                me.list.length = info.size || 0;
                me.info = {};
                _.extend(me.info, info);
                me.update(data, info, function (data) {
                });
            });
        },

        _check : function (data) {
            var correct = true;
            if (data.length === 0) return false;
            // 此处不适用原生的迭代方法，包括在此基础上的underscore some方法
            // 因按照标准 undefined的数组项在迭代的时候会被跳过
            for (var i = 0, l = data.length; i < l;i++) {
                if (data[i] === undefined) {
                    correct = false;
                    break;
                }
            }
            return correct;
        },

        fetch : function (offset, limits, callback) {
            var me = this;
            var data = me.list.slice(offset, limits + offset);
            if (me._check(data)) {
                // 本地数据完整
                data.total = me.info.size;
                return $.isFunction(callback) ? callback(data) : null ;
            } else {
                // 本地数据不完整 需发请求
                if (me.info) {
                    offset = offset > me.info.size ? me.info.size : offset;
                }
                me.server.fetch(offset, limits, function (data, info) {
                    me.update(data, info, function (json, info) {
                        _.extend(data, info);
                        json.total = info.size;
                        return $.isFunction(callback) ? callback(data) : null ;
                    });
                });
            }
        },

        update : function (data, info, callback) {
            var me = this;
            if ('function' === typeof me.opt.preprocessor) {
                data = me.opt.preprocessor(data);
            }
            [].splice.apply(me.list, [info.offset, info.limits].concat(data));
            return $.isFunction(callback) ? callback(data, info) : null ;
        },

        _remove : function (urls) {
            var inx, curItem;
            var me = this;
            _.each(urls, function (url) {
                curItem = _.findWhere(me.list, {
                            url : url
                        });
                if (_.isObject(curItem)) {
                    inx = _.indexOf(me.list, curItem);
                    me.list.splice(inx, 1);
                    me.info.size--; // 更新本地数目
                }
            });
        },

        // 接收对应的model引用数组作为参数
        remove : function (models, callback) {
            var me = this;
            var urls = _.pluck(models, 'url');
            me.server.remove(urls, function (status) {
                if (status.suc) {
                    me._remove(urls);
                    $.isFunction(callback) && callback();
                }
            });
        }
    });

    module.exports = Data;

});