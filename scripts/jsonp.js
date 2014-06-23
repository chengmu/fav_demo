/**
 * jsonp方法
 * 供不在线上环境开发时测试使用
 */
define(function (require, exports, module) {




    module.exports = function (conf) {
        var jsonpCallback = 'test' + (+new Date());
        // var params = conf.params || {};
        // params['jsonp'] = jsonpCallback;
        var timerHandler = null;

        /**
        * JSONP的函数,如果请求到的数据为空，则执行error函数
        */
        window[jsonpCallback] = function (json) {

            //如果请求成功则清除超时计时器
            window.clearTimeout(timerHandler);
            $('#' + jsonpCallback).remove();
            if (json === null) {

                if (_.isFunction(conf.error)) {
                    conf.error.call(conf.context);
                }

            } else {

                if (_.isFunction(conf.success)) {
                    conf.success.call(conf.context, json);
                }
            }
        };

        // use script tag send a request, imitate ajax
        var script = document.createElement('script');

        //下面的函数在script的onerror的时候或者是请求超时时
        //执行，因为script的onerror不兼容IE9-
        var isOnerrorTrigger = _.once(function () {
            if (_.isFunction(conf.error)) {
                conf.error.call(conf.context);
            }
        });

        //拼接script的请求地址
        script.type = 'text/javascript';
        script.id = jsonpCallback;
        // var src = url + '?josnp=' + jsonpCallback + '?';
        var src = conf.url.split('?')[0]+ '?jsonp=' + jsonpCallback + '&' +  conf.url.split('?')[1];
        script.src = src.substr(0, 1900);
        script.charset = 'utf-8';
        script.onerror = function () {
            isOnerrorTrigger();
        };
        document.getElementsByTagName('head')[0].appendChild(script);

        // timing starts
        var timeoutHandler = function () {
            //console.log('sorry! is time out '+constant.timeout);
            window[jsonpCallback] = function () {};
            isOnerrorTrigger();
        };

        timerHandler = window.setTimeout(timeoutHandler, 1 * 1000);

    };
});