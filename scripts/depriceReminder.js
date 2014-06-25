define(function (require, exports, module) {
    'use strict';
    var code = require('./code.js');
    var combParams = require('./utils.js').combParams;
    // test
    // var url = 'http://zhushou.huihui.cn/api/pricehub/additem?';

    var m = code.encrypt('http://www.amazon.cn/gp/product/B0094J3AMS/ref=s9_simh_gw_p21_d0_i7_gs9w?pf_rd_m=A1AJ19PSB66TGU&pf_rd_s=center-2&pf_rd_r=0GSFM8AEGC5AHRFJX6FW&pf_rd_t=101&pf_rd_p=172747952&pf_rd_i=899254051', 2, true);
    // $.ajax({
    //     url : url + 'expect=' + 80 + '&m=' + m,
    //     success : function (obj) {
    //         console.log('add', obj);
    //     }
    // });

    // url = 'http://zhushou.huihui.cn/api/pricehub/queryitem?';

    // $.ajax({
    //     url : url + 'm=' + m,
    //     success : function (obj) {
    //         console.log('query', obj);
    //     }
    // });

    var dr = {};
    module.exports = dr;

    var BASE_URL = 'http://zhushou.huihui.cn/api/pricehub/';

    var apis = {
        add : 'additem',
        get : 'queryitem'
    };

    dr.getExpectPrice = function (url, callback) {
        $.ajax({
            url : combParams(BASE_URL, apis.get, {
                m : code.encrypt(url, 2, true)
            }),
            dataType : 'json',
            success : callback,
            fail : callback
        });
    };

    dr.setExpectPrice = function (url, expectPrice, callback) {
        $.ajax({
            url : combParams(BASE_URL, apis.add, {
                m : code.encrypt(url, 2, true),
                expect : expectPrice
            }),
            dataType : 'json',
            success : callback,
            fail : callback
        });
    };

    // var testUrl = 'http://www.amazon.cn/mn/detailApp?asin=b00ecv8px2';

    // dr.getExpectPrice(testUrl, function (res) {
    //     console.log('get', res);
    // });
    // dr.setExpectPrice(testUrl, 50, function (res) {
    //     console.log('set', res);
    // });

});