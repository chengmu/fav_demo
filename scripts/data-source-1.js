define(function (require, exports, module) {

    var baseurl = 'datas/view1-data.json';

    var data = {};

    data._request = function (query, callback) {
        var successHandle = function (json) {
            _.isFunction(callback) && callback(json);
        };

        $.ajax({
            url: baseurl,
            dataType: 'json',
            cache: false,
            success: successHandle
        });
    };

    data.getData = function (query, callback) {
        // deal with query
        // query = _.extend(query, default_query);
        var self = this;
        this._request(query, function (json) {
            _.isFunction(callback) && callback.apply(self, [json]);
        });
    };

    return data;
});