define(function (require, exports, module) {

    var Data = require('./data.js');
    var data = new Data({
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

    data.getData = function (pageConf, callback) {
        var offset, limites;
        if ('number' === typeof pageConf.counts) {
            offset = (pageConf.page -  1) * 20 + pageConf.counts;
        } else {
            offset = (pageConf.page -  1) * 20;
        }

        if ('object' === typeof pageConf.filter) {
            limites = 20;
        } else {
            limites = 5;
        }
        data.fetch(offset, limites, function (json) {

            if ('object' === typeof pageConf.filter) {
                var total = json.total;
                json = _.where(json, pageConf.filter);
                json.total = total;
                callback(json);
            } else {
                callback(json);
            }
        });
    };

    return data;
});
