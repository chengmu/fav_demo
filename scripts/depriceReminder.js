define(function (require, exports, module) {
    'use strict';
    var code = require('./code.js');
    // test
    var url = 'http://zhushou.huihui.cn//api/pricehub/add/item?';

    var m = code.encrypt('http://detail.tmall.com/item.htm?id=19321086647', 2, true);
    $.ajax({
        url : url + 'expect=' + 20 + '&m=' + m,
        success : function (obj) {
            console.log(obj);
        }
    });



});