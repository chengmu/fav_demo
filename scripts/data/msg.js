define(function (require, exports, module) {

    var Data = require('./data.js');
    var serverOpt = {
         // ?start=0&length=10
        BASE_URL : 'http://zhushou.huihui.cn/api/myzhushou/collection/',
        GET_API : 'messageList',
        keys : ['allsize', 'newNum'],

        filter : function (data) {
            // 数据处理
            return data;
        }
    };

    var data = new Data({

        // 服务配置
        server : serverOpt,
        // 数据处理
        preprocessor : function (raw) {

            return raw;
        }
    });

    data.getData = function (param, callback) {
        var start = (param.page -  1) * 20;
        var offset = param.counts ? start + param.counts : start;
        var limites = 'object' === typeof param.filter ? 20 : 5;
        data.fetch(offset, limites, function (json) {
            if ('object' === typeof param.filter) {
                var total = json.total;
                json = _.where(json, param.filter);
                json.total = total;
                callback(json);
            } else {
                callback(json);
            }
        });
    };

    window.msg = data;
    return data;

});
