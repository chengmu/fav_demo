define(function (require, exports, module) {
    'use strict';

    var tmpl = _.template(require('./login.html'));
    var url = 'http://youdao.com';
    var targetUrl = encodeURIComponent(url);

    $('#pop').html(tmpl({
        local : {
            targetUrl : targetUrl
        }
    }));
    var login = require('./login');
});