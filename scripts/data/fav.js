define(function (require, exports, module) {

    var Data = require('./data.js');

    var serverOpt = {
        // ?start=0&length=10
        BASE_URL : 'http://zhushou.huihui.cn/api/myzhushou/collection/',
        GET_API : 'list',
        DEL_API : 'delurls',
        keys : ['login', 'jifenUrl', 'used', 'pricehubSize'],

        filter : function (data) {
            // 数据处理
            return data;
        }
    };

    var data = new Data({

        server : serverOpt,

        preprocessor : function (raw) {
            _.each(raw, function(item) {
                if (item.lastSecondPrice !== -1 && item.lastSecondPrice - item.curPrice > 0) {
                    item.depriced = true;
                }
                if (item.promotionInfo || item.depriced) {
                    item.inSalesPromotion = true;
                }
            });
            return raw;
        }
    });

    data.getData = function (param, callback) {
        var start = (param.page -  1) * 20;
        var offset = param.counts ? start + param.counts : start;
        var limites = 'object' === typeof param.filter ? 20 : 5;
        data.fetch(offset, limites, function (json) {
            if ('object' === typeof param.filter) {
                var total = json.total || 0;
                json = _.where(json, param.filter);
                json.total = total;
                callback(json);
            } else {
                callback(json);
            }
        });
    };

    return data;
});
