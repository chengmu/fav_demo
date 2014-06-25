define(function (require, exports, module) {
    var utils = {};

    /**
     * 合并参数
     */
    utils.combParams = function (base, api, params) {
        var url = '';
        url = base + api + '?';
        for (var key in params) {
            if (params.hasOwnProperty(key)) {
                url += key + '=' + params[key] + '&';
            }
        }
        return url.slice(0, url.length - 1);
    };

    utils.getKey = function (tab, nav) {
        return tab + '_' + nav;
    };

    utils.paging = (function () {
        var PL = 9; // page elements length
        var PC = 20; // count of pre page
        var DOT_SPACE = '...';
        /**
         * 计算分页，根据参数，输出一个数组. 使得当前页码尽量出现在中间位置
         *     [1, ..., 5, 6, 7, ..., 100].currentPage
         * @param  {Number} total 总条目数，注意不是总页数
         * @param  {Number} currentPage 当前页码
         * @param  {Number} pl 需要展示的页码数量
         * @param  {Number} pc 每页显示的条目数
         * @param  {String} dotSpace 隐藏页码区域展示的内容
         * @return {Array}  [1, ..., 5, 6, 7, ..., 100].currentPage
         */
        return function (total, currentPage, pl, pc, dotSpace) {
            if (arguments.length < 2) return [];
            pl || (pl = PL);
            pc || (pc = PC);
            dotSpace || (dotSpace = DOT_SPACE);
            var t = Math.ceil(total/pc); // 总页码数
            var c = currentPage || 1;
            c = c > t ? t : c < 1 ? 1 : c; // fixed current page

            var o = [], i;

            // 1、如果页码总数小于默认值，则直接输出
            if (t <= pl) {
                for (i = 1; i <= t; i++) o.push(i);
            }
            // 2、如果页码总数大于默认值，需特殊处理，使得当前页的页码尽可能居中
            else {
                var md = Math.ceil(pl/2), i;
                // 2.1 以当前页码为中心，向前/向后递减
                for (i = c - md + 1; i <= c + pl - md; i++) o.push(i);
                // 2.2 修正数组的取值范围为 [1, t]
                (function trimValue(v) {
                    if (v !== 'firstTime') {
                        for (var i = 0, l = o.length; i < l; i++) {
                            o[i] = o[i] + v;
                        }
                    }
                    if (o[0] < 1) trimValue(Math.abs(o[0] - 1));
                    if (o[o.length - 1] > t) trimValue(t - o[o.length - 1]);
                })('firstTime');
                // 2.3 满足第一页和最后一页的页码必需出现的要求
                if (o[0] !== 1) { o[0] = 1; o[1] = dotSpace; }
                if (o[o.length - 1] !== t) {
                    o[o.length - 1] = t;
                    o[o.length - 2] = dotSpace;
                }
            }
            // 当前页码
            o.currentPage = c;
            return o;
        };
    })();

    return utils;
});