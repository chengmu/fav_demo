define(function (require, exports, module) {
    'use strict';
    var code = require('./code.js');
    var combParams = require('./utils.js').combParams;
    var Pop = require('./popout/pop.js');

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


    var num_reg = /^\d+(\.[0-9]{0,2})?$/;
    var tmplString = [
        '<div id="modifyExpectPrice">',
            '<label for="expectPrice">目标价格：</label>',
            '<input type="text" id="expectPrice" name="expectPrice" value="' + '<%=price%>' + '"/>',
            '<p class="error">*请填写有效数值</p>',
        '</div>'
        ].join('');

    dr.setPricePop = function (url, curPrice) {
        dr.getExpectPrice(url, function (res) {
                console.log('获取目标价格, url:', url, '，返回：', res);
                var expectPrice = res.success && res.expectPrice !== '0.0' ? res.expectPrice : curPrice;
                var content = _.template(tmplString, {
                    price : expectPrice
                });
                var pop = new Pop({
                    data : {
                        'title' : '修改降价提醒目标价',
                        'content' : content
                    },
                    confirmHandle : function () {
                        var price = this.$el.find('input').val();
                        if (num_reg.test(price)) {
                            dr.setExpectPrice(url, price, function (res) {
                                console.log('设置成功！', res);
                            });
                            return true;
                        } else {
                            this.$el.find('.error').show();
                            return false;
                        }
                    }
                });

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