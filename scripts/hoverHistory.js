/**
 * 助手历史走势falsh展示模块
 * @param  {[type]} exports [description]
 * @param  {[type]} module  [description]
 * @return {[type]}         [description]
 * @author  zhulin
 * @date 2014-05-20
 *//* withDoc hoverHistory.js*/
define(function (require, exports) {
    'use strict';

    var itemRe,
        hostname = location.hostname,
        pathname = location.pathname;

    var SER_URL = 'http://zhushou.huihui.cn/productSense';
    var LOG_URL = 'http://zhushou.huihui.cn/log';


    var isShowPriceTrendShare = false;

    /**
     * 辅助方法： comboParams
     */
     var comboParams = function (oParam) {
        var pa = [];
        var k;

        for (k in oParam) {
            if (oParam.hasOwnProperty(k)) {
                if (k === 'jsonp') {
                    pa.unshift(k + '=' + encodeURIComponent(oParam[k]));
                } else {
                    pa.push(k + '=' + encodeURIComponent(oParam[k]));
                }
            }
        }
        pa.push('t=' + (+new Date()));
        return pa.join('&');
    };

    /**
    * 得到一个map里面的area相对于map的位置和,每个area的高和宽
    *
    * @method getCoordsPosition
    * @param {Array} area的coords属性，然后split(",")得到的数组
    * @public
    * @return {Object} dimension.left:area相对于对于map的left值;dimension.top:
    *                   area相对于map的top值;dimension.width,dimension.height;
    *
    */
    var getCoordsPosition = function (coordsArray) {
        var maxX, maxY, minX, minY, areaWidth, areaHeight;
        var i, coords;
        var dimension = {};
        coords = _.map(coordsArray, function (coord) {
            if (coord < 0) {
                return 0;
            }
            return coord;
        });
        //get the left  and top  of the area
        maxX = minX = parseInt(coords[0], 10);
        maxY = minY = parseInt(coords[1], 10);

        //If the area is polygen, we must get
        //the maxX and maxY.
        for (i = 0; i < coords.length; i += 2) {
            var xx = parseInt(coords[i], 10);
            var yy = parseInt(coords[i + 1], 10);

            if (xx > maxX) {
                maxX = xx;
            }

            if (xx < minX) {
                minX = xx;
            }

            if (yy > maxY) {
                maxY = yy;
            }

            if (yy < minY) {
                minY = yy;
            }
        }

        areaWidth = maxX - minX;
        areaHeight = maxY - minY;

        dimension.left = minX;
        dimension.top = minY;
        dimension.width = parseInt(areaWidth, 10);
        dimension.height = parseInt(areaHeight, 10);

        return dimension;

    };

    /**
    * 价格预览模块，这个模块实现的功能是，当鼠标hover在商品图片上的时候，提取对应
    * 的item url,返回给服务器，然后接到服务器返回的数据后填到模板中。在这里也包含了
    * 对map的处理。实现的难度为单品的url提取和弹出框位置的确定。
    *
    * @class hoverHistory
    * @constructor
    */
    var hoverHistoryInfo = {

        /**
        * 基本信息的配置，包括设置hover监听的元素的基本配置
        * baseInfo.elem 监听的元素 'a img, area'
        * baseInfo.attr 目标元素的属性 href
        * baseInfo.depth hover的元素到目标元素最多的层级 3
        *
        * @property baseInfo
        * @type object
        */
        baseInfo: (function () {
            var domain = document.domain;
            var url = document.URL;
            var config = {};

            config.className = "body";
            //config.elem = 'a img, area, [data-purpose="GWZS_galleryTip"]';
            config.elem = 'a img';
            config.attr = "href";
            config.depth = 3;

            return config;
        }()),

        /**
        *存放已经被hover过的href的list
        *
        * @property hrefList
        * @type Object
        * @default null
        */
        hrefList: {},

        hrefMouseIn: undefined,

        isCluster: undefined,

        priceInfro: {},

        // the time which the tip begin to show
        timeShowBegin: undefined,

        /**
        * map对应生成div的ID，在折扣提醒tip中有用
        *
        * @property mapId
        * @default undefined
        */
        mapId: undefined,

        /**
        * 判断是否是IE6 或者是IE7的原生模式，
        * 因为base64在IE7的兼容模式可以显示
        * 而在原生的模式上面就显示不了
        *
        * @property isDataURISupported
        * @type boolean
        */
        isDataURISupported: (function () {

            if ($.browser.msie && ($.browser.version === "6.0")) {
                return false;
            }

            if (($.browser.version === "7.0") && (!document.documentMode)) {
                return false;
            }

            return true;
        }()),

        /**
        * 此模块的功能入口，在这里设置了对元素的代理，需要注意的是，对
        * 折扣tip hover的处理也放在这里。当hover在一个img上的时候，通过
        * url来判断是否有对应的tip，如果有那么就改tip的样式。
        *
        * @method trigger
        */
        trigger: function () {

            var timerFirstIn, timerSecondIn,  timerDelay;
            var that = this;
            var config = this.baseInfo;
            var tipsId = "#youdaoGWZS_hover-tips";

            $(config.className).delegate(config.elem, "mouseenter", function (event) {


                var self = this;
                var $this = $(this);
                var imgOrigin = $this.attr("data-origin");
                if (imgOrigin === "zhushou") {
                    return;
                }

                var target = event.target;
                var coords = target.coords;
                var href = that.getValidHref(self);
                var dimension = that.getDimension(target, coords);
                var isHoverHistoryOpen = true;

                that.hrefMouseIn = href;

                //If the href is not a item,do nothing and return
                if (href === undefined) {
                    return;
                }

                //判断是否存在map,  触发折扣tip的hover
                if (dimension.mapId) {
                    that.mapId = dimension.mapId;
                    that.triggerDiscTipsMap(that.mapId, href, true);
                }
                that.triggerDiscTips(self, true);

                //console.log("mouse enter the element")
                //if have other view or timerDelay, first clear it
                //console.log("debug");
                that.removeView();
                clearTimeout(timerDelay);

                //If mouse enter the same tag again,we need't send
                //request again.Just read info from hrefList
                if (that.hrefList.hasOwnProperty(href) && that.hrefList[href] !== null) {
                    timerSecondIn = setTimeout(function () {
                        that.renderView(that.hrefList[href], href, dimension);
                    }, 500);

                } else {
                    timerFirstIn = setTimeout(function () {
                        that.hrefList[href] = null;
                        that.requestData(href, that.hrefList[href], dimension);
                    }, 300);
                }

            });

            $(config.className).delegate(config.elem, "mouseleave", function () {

                //console.log("mouse leave");
                clearTimeout(timerFirstIn);
                clearTimeout(timerSecondIn);
                that.triggerDiscTips(this);
                if (that.mapId && that.hrefMouseIn) {
                    that.triggerDiscTipsMap(that.mapId, that.hrefMouseIn);
                }

                if ($(tipsId).length > 0) {

                    //console.log("have other tips!start the timeDelay");
                    timerDelay = setTimeout(function () {
                        that.removeView();
                        that.hrefMouseIn = '';
                    }, 200);
                }

            });

            $(document).delegate(tipsId, "mouseenter", function () {

                //console.log("I am in hover-tips,clear the delay timer");
                clearTimeout(timerDelay);
            });

            $(document).delegate(tipsId, "mouseleave", function () {

                //console.log("leave the tips");
                that.removeView();
            });

            $(document).delegate(".see-guide a", "click", function () {
                that.sentLogInfo("HISTORY_HOVER3_CLICK", 0, 0, isCluster);
            });

        },

        /**
        * 触发在map上的折扣tip的hover样式，在这里之所以蛋疼的先把class
        * 先取出来，然后加上_mouseIn再放回去是因为在IE6存在不支持类的交集
        * 选择器.
        * 通过mapID,来寻找对应tip的父容器div
        *
        * @method triggerDiscTipsMap
        * @param {String} mapId
        * @param {String} href
        * @param {Boolean} mouseIn or mouseOut
        */
        triggerDiscTipsMap: function (mapId, href, isMouseIn) {
            var classType;
            var validHref = href.toLowerCase();
            var mapIndex = "youdaoGWZS_" + mapId;
            var childSelector = 'div[data-url="' + validHref + '"]';
            var temptTip = $("#" + mapIndex).children(childSelector);

            if (temptTip.length > 0) {
                classType = temptTip.attr('class').split(" ")[1] + "_mouseIn";
                if (isMouseIn) {
                    temptTip.addClass(classType);
                } else {
                    temptTip.removeClass(classType);
                }
            }
        },

        /**
        * 触发a img类型上的hover功能。
        *
        * @method triggerDiscTips
        * @param {String} imgTag
        * @param {Boolean} mouseIn or mouseOut
        */
        triggerDiscTips: function (imgTag, isMouseIn) {
            var targetImag = $(imgTag);
            var classType;
            var targetTip = $(targetImag.next('.youdaoGWZS_gallerTips')[0]);

            if (targetTip.length > 0) {
                classType = targetTip.attr('class').split(" ")[1] + "_mouseIn";

                if (isMouseIn) {
                    $(targetTip).addClass(classType);
                } else {
                    $(targetTip).removeClass(classType);
                }
            }
        },

        /**
        * 请求数据
        *
        * @method requestData
        * @param {String} item的href
        * @param {Object} 返回的数据对象
        * @param {Object} tips插入位置的位置信息
        * @private
        * @return {String} returnDescript
        */
        requestData: function (href, resultObj, dimension) {
            var that = this;
            var startTime = new Date();
            var json = {

                url : SER_URL + '?phu=' + encodeURIComponent(href) + '&t=' + (new Date).getTime(),

                success: function (data) {
                    var property;
                    var timeCounterRequest;
                    resultObj = {};

                    for (property in data) {
                        if (data.hasOwnProperty(property)) {
                            resultObj[property] = data[property];
                        }
                    }

                    if (resultObj !== null) {

                        timeCounterRequest = (new Date()) - startTime;
                        resultObj.timeCounterRequest = timeCounterRequest;
                        resultObj.isSendLog = false;

                        that.hrefList[href] = resultObj;
                        that.renderView(resultObj, href, dimension);

                    }
                },
                error: function () {
                    //console.log("have no data");
                    that.hrefList[href] = null;
                }
            };

            //If the client is ie6 or ie7,attach another request parameter
            if (!this.isDataURISupported) {
                json.params.type = "url";
            }

            $.ajax(json);
        },

        getDimension: function (target, coords) {
            var layoutY, layoutX, dimension, mapId, coordsInfo;
            var mapName, offsetLeft, offsetTop, lengthAppending;
            var limitLength, subLength;
            var tipsSizeInfo = {};
            var i;
            var $img;
            tipsSizeInfo.width = 267;
            tipsSizeInfo.height = 222;

            //If the target is the area ,first found the map and then
            //found the tarched image.
            if (coords !== undefined) {
                mapName = "#" + $(target).parent().attr("name");

                // for <img usemap="#map"> <map name="Map">
                $img = $("[usemap]").filter(function () {
                    return this.useMap.toLowerCase() === mapName.toLowerCase();
                });

                mapId = $img.attr('usemap').substring(1);
                offsetLeft = $img.offset().left;
                offsetTop = $img.offset().top;
                coords = coords.split(",");
                coordsInfo = getCoordsPosition(coords);

                //get the dimension of the area which
                //is related to the page
                layoutX = parseInt(offsetLeft, 10) + coordsInfo.left;
                layoutY = parseInt(offsetTop, 10) + coordsInfo.top;

                //the dimension of the tips
                //x:the picture's coordinate and the width of the anchor
                //arrowVeritical:just the half of the tips
                dimension = {
                    x: layoutX + coordsInfo.width,
                    y: layoutY,
                    arrowDirection: "left",
                    arrowVeritical: tipsSizeInfo.height / 2
                };

                limitLength = $(window).width() - dimension.x;

                //If the length between the window left and dimension.x
                //samaller than tip's length,the arrow will show on the
                //right
                if (limitLength < tipsSizeInfo.width) {
                    dimension.arrowDirection = "right";
                    dimension.x -=  parseInt(coordsInfo.width, 10);
                    dimension.x -= tipsSizeInfo.width;
                }

                //If the anchor's height is more than the
                //tips, and then the tips's y will be the
                //subtraction
                //console.log("coordsInfo: ", coordsInfo);
                if (coordsInfo.height > tipsSizeInfo.height) {
                    subLength = coordsInfo.height - tipsSizeInfo.height;
                    dimension.y += subLength / 2;
                }

                dimension.mapId = mapId;

                //console.log("dimension: ", dimension);
            } else {

                layoutY = target.clientHeight / 2;
                layoutX = target.clientWidth + 15;
                offsetLeft = $(target).offset().left;
                dimension = {
                    x: parseInt(offsetLeft, 10) + layoutX,
                    y: $(target).offset().top,
                    arrowDirection: "left",
                    arrowVeritical: layoutY - 15
                };
                limitLength = $(window).width() - dimension.x;

                if (limitLength < tipsSizeInfo.width) {
                    dimension.arrowDirection = "right";
                    dimension.x -= layoutX;
                    dimension.x -= tipsSizeInfo.width;

                    if (offsetLeft < tipsSizeInfo.width) {
                        dimension.arrowDirection = "left";
                        lengthAppending = tipsSizeInfo.width - offsetLeft + 5;
                        dimension.x += lengthAppending;
                        dimension.x += layoutX / 2;
                    }
                }


                if (target.clientHeight > tipsSizeInfo.height) {
                    subLength = target.clientHeight - tipsSizeInfo.height;
                    dimension.y += subLength / 2;
                    dimension.arrowVeritical = tipsSizeInfo.height / 2;
                }

            }

            return dimension;

        },

        getValidHref: function (targetElem) {
            var config = this.baseInfo;
            var target = $(targetElem);
            var href;
            var regUrl = /^http:/,
                tmallUrlReg = /^\/\//,
                regUrlBegin = /^\//,
                regDealDangDang = /^http:\/\/union.dangdang.com/;
            var i, temptElem, depth = config.depth;
            var pathnameIndex, pathFolder;
            var backurl, httpIndex, backurlIndex;
            //var targetDataPurpose = target.attr('GWZS_galleryTip');


            //
            // var vendor = cache.conf.vendor;
            var thisDomain = document.domain;
            // if (cache.data !== undefined && cache.data.itemRe !== undefined) {
            //     itemRe = new RegExp(cache.data.itemRe);
            // } else {
            //     return;
            // }

            for (i = 0; i < depth; i += 1) {

                href = target.attr(config.attr);
                if (href !== undefined && href !== "") {
                    break;
                }
                target = $(target).parent();
            }

            if (regDealDangDang.test(href)) {
                backurlIndex = href.lastIndexOf("&backurl=");
                backurl = href.substring(backurlIndex);
                httpIndex = backurl.indexOf("http:");
                href = backurl.substring(httpIndex);
            }

            //天猫搜索页面的item是以//开头的
            if (tmallUrlReg.test(href)) {
                href = "http:" + href;
            }

            //test href ,the href must begin with
            //**http:**,otherwhise add protocol and
            //hostname to the href
            var protocal = 'http';
            if (!regUrl.test(href)) {
                //Deal the situation which href is
                //**test/one.html**,must begin with
                //slides
                //Test website:
                //http://www.suning.com/emall/brandshop_10052_10051_zhishihuayuan_.html
                //http://www.vipshop.com/show-0-34939-0.html
                if (!regUrlBegin.test(href)) {

                    pathnameIndex = pathname.lastIndexOf("/");

                    if (pathnameIndex > 0) {
                        pathFolder = pathname.substring(0, pathnameIndex);
                        href = pathFolder + "/" + href;
                    } else {
                        href = "/" + href;
                    }
                }
                href = protocol + '//' + hostname + href;
            }


            //Test the href whether belong to the item
            if (itemRe !== undefined && !itemRe.test(href)) {
                return;
            }

            return href;
        },

        renderView: function (resultObj, href, dimension) {
            var view;
            var that = this;
            var priceInfo;

            if (!this.isEmpty(resultObj)) {
                return;
            }

            if (href !== that.hrefMouseIn) {
                return;
            }

            priceInfo = that.viewHelper(resultObj);
            that.priceInfo = priceInfo;

            view = _.template(this.view)({
                dimensionY: dimension.y,
                dimensionX: dimension.x,
                resultObj: resultObj,
                arrowDirection: dimension.arrowDirection,
                arrowVeritical: dimension.arrowVeritical,
                href: href,
                link: priceInfo.link,
                type: priceInfo.type,
                img: resultObj.img,
                site: resultObj.site,
                priceInfo: priceInfo,
                detail: priceInfo.detail,
                url: resultObj.imgurl,
                isDataURISupported: that.isDataURISupported,
                isShowPriceTrendShare : isShowPriceTrendShare
            });
            $("body").append(view);

            this.timeShowBegin = new Date();
        },

        viewHelper: function (resultObj) {
            var priceInfo = {};
            var max = resultObj.max,
                min = resultObj.min,
                hasLower = resultObj.hasLower,
                link = resultObj.link,
                lowestSite = resultObj.lowestSite,
                lowestPrice = resultObj.lowestPrice,
                today = resultObj.today;

            //是否有其他商家最低价
            if (lowestPrice) {
                priceInfo.lowestPrice = lowestPrice;
                priceInfo.lowestClass = "youdaoGWZS_hoverHistory_lowest";
                priceInfo.clusterUrl = resultObj.clusterUrl;
                priceInfo.isHaveLowest = true;
            } else {
                priceInfo.lowestPrice = "暂无";
                priceInfo.lowestClass = "";
                priceInfo.isHaveLowest = false;
            }

            if (link && link.type === "guide") {
                priceInfo.type = "guide";
            } else if (link && link.type === "discount") {
                priceInfo.type = "discount";
            } else {
                priceInfo.type = "";
            }

            priceInfo.link = link;
            priceInfo.todayValue = today;
            priceInfo.maxValue = max;
            priceInfo.minValue = min;
            priceInfo.showToday = false;
            priceInfo.hasLower = hasLower;
            priceInfo.lowestSite = lowestSite + "更低价";

            if (max === min) {
                priceInfo.showToday = true;
                priceInfo.todayOnly = true;
                priceInfo.todayText = "今日：";
            } else {

                if (max === today) {

                    priceInfo.maxText = "今日最高：";
                    priceInfo.minText = "最低：";

                } else if (min === today) {
                    priceInfo.todayMin = true;
                    priceInfo.maxText = "最高：";
                    priceInfo.minText = "今日最低：";

                } else {

                    priceInfo.showToday = true;
                    priceInfo.todayText = "今日：";
                    priceInfo.maxText = "最高：";
                    priceInfo.minText = "最低：";
                }

            }

            return priceInfo;
        },

        isEmpty: function (obj) {
            var k;
            return ((function () {for(k in obj)return k})() !== null ? true : false);
        },

        removeView: function () {

            var showTime;
            var timeCounterRequest;
            var thisItem = this.hrefList[this.hrefMouseIn];

            if ($("#youdaoGWZS_hover-tips").length > 0) {
                $("#youdaoGWZS_hover-tips").remove();
            }

            //count the time between show and remove
            //if the time is more than 1s and then sendLog
            //only once time
            if (thisItem && !thisItem.isSendLog) {
                showTime = (new Date()) - this.timeShowBegin;

                if (showTime > 1000) {

                    //formate number to float
                    showTime = Math.round(showTime / 100) / 10;
                    timeCounterRequest = thisItem.timeCounterRequest;
                    timeCounterRequest = Math.round(timeCounterRequest / 100) / 10;
                    var isCluster = thisItem.lowestPrice ? 1 : 0;
                    this.sentLogInfo("HISTORY_HOVER3", timeCounterRequest,
                                     showTime, isCluster);
                    thisItem.isSendLog = true;
                }

                //reset the time counter
                this.timeShowBegin = undefined;
            }
        },

        sentLogInfo: function (action, responseTime, showTime, isCluster) {

            var logType = "ARMANI_EXTENSION_ACTION";
            var logAction = action;
            var temptImg = new Image();
            var json, params;
            var priceInfo;

            priceInfo = this.priceInfo;


            //send timeCounter
            // json = {
            //     action: action,
            //     browser: cache.localConf.browser || cache.conf.browser,
            //     extensionid: cache.localConf.extensionid || '',
            //     cluster: isCluster,
            //     vendor: cache.conf.vendor,
            //     type: logType,
            //     murl: this.hrefMouseIn
            // };
            json = {
                action: action,
                cluster: isCluster,
                type: logType,
                murl: this.hrefMouseIn
            };

            if (responseTime) {
                json.t1 = responseTime;
            }

            if (showTime) {
                json.t2 = showTime;
            }

            if (priceInfo.link) {
                json.linktype = encodeURIComponent(priceInfo.link.type);
                json.anchor = priceInfo.link.anchor;
                json.target = encodeURIComponent(priceInfo.link.target);
            }
            if (priceInfo.hasLower) {
                json.hasLower = true;
            }

            params = comboParams(json);

            return true;
        },

        view: '<div id="youdaoGWZS_hover-tips" ' +
                    'style="position:absolute; top:<%= dimensionY %>px;' +
                    'left:<%= dimensionX %>px; "' +
                    'class="clearfix youdaoGWZS_hover-tips<%= type %>">' +
                    '<div class="youdaoGWZS_hover-tips-hd">'+
                    '</div>'+
                    '<h3>' +
                        '<span class="hui-logo"></span><span>价格预览</span>' +
                    '</h3>' +
                    '<% if (isDataURISupported) { %>' +
                        '<img src="data:image/png;base64,<%= img %>" />' +
                    '<% } else { %>' +
                        '<img src="<%= url %>" />' +
                    '<% } %>' +
                    '<% if (!priceInfo.todayOnly) { %>' +
                        '<ul>' +
                            '<li>' +
                                '<span><%= priceInfo.maxValue %></span>' +
                            '</li>' +
                            '<li class="min <%= priceInfo.todayMin ? "todayMin ":""  %>" >' +
                                '<span><%= priceInfo.minValue %></span>' +
                            '</li>' +
                        '</ul>' +
                    '<% } %>' +
                    '<% if (isShowPriceTrendShare) { %>' +
                        // '<a class="-price-trend-share hui-price-trend-share" ' +
                        //         'clkAction = "HISTORY_HOVER3_PRICE_TREND_BUTTON_CLICK" ' +
                        //         'href="<%= resultObj.priceTrendShare.shareUrl%>" target="_blank">' +
                        //         '<i></i>' +
                        //         '<%= resultObj.priceTrendShare.anchor %> ' +
                        //     '</a>' +
                    '<% } else { %>' +
                          '<a class="-price-trend-share hui-price-trend-share" ' +
                                'clkAction = "HISTORY_HOVER3_APP_PROMOTE_CLICK" ' +
                                'href="http://www.huihui.cn/app?keyfrom=zhushou " target="_blank">' +
                                '<i></i>' +
                                '手机也能比价、看走势啦！点我下载&gt;&gt;' +
                            '</a>' +
                    '<% } %>' +
                    '<div class="other-vendor-wrapper">' +
                        '<p class="other-vendor-content"' +
                            'style="<% if (!priceInfo.isHaveLowest) { %>' +
                                'margin-top: 12px;' +
                                '<% } %>">' +
                            ' <% if (priceInfo.isHaveLowest) { %>' +
                                '<a class="<%= priceInfo.lowestClass %>" target="_blank"' +
                                        'clkAction = "HISTORY_HOVER3_BUTTON_CLICK" ' +
                                        'href="<%= priceInfo.clusterUrl %>">' +
                                '<i></i>' +
                                '<%= priceInfo.hasLower ? priceInfo.lowestSite : "其他商家最低价" %>' +
                                    '：<%= priceInfo.lowestPrice %>' +
                                '</a>' +
                                '<a class="see-other-vendor" target="_blank" ' +
                                    '<% if (isShowPriceTrendShare) { %>' +
                                        'style="background: none;"' +
                                    '<% } %>' +
                                    'clkAction = "HISTORY_HOVER3_BUTTON_CLICK" ' +
                                    'href="<%= priceInfo.clusterUrl %>">' +
                                    '去看看' +
                                    '<% if (isShowPriceTrendShare) { %>' +
                                        '>>' +
                                    '<% } %>' +
                                '</a>' +
                            '<% } else { %>' +
                                '<span>' +
                                '<i></i> 其他商家最低价：暂无' +
                                '</span>' +
                            '<% } %>' +
                        '</p>' +
                    '</div>' +
                    '<% if (false) { %>' +
                    '<div class="see-guide">' +
                        '<a href="<%= link.target %>" target="_blank">' +
                        '<%= link.anchor %>' +
                        '</a>' +
                        '<i></i>' +
                    '</div>' +
                    '<% } %>' +
                    '<p class="mothsAgo">' +
                        '<span class="longTime">2月前</span>' +
                        '<span>1月前</span>' +
                    '</p>' +
                    '<% if (priceInfo.showToday) { %>' +
                        '<p class="todayPrice">' +
                            '<span><%= priceInfo.todayValue %></span>' +
                        '</p>' +
                    '<% } %>' +
                    '<span class="<%= arrowDirection %> arrow "' +
                            'style="top:<%= arrowVeritical %>px"></span>' +
                '</div>'

    };

    hoverHistoryInfo.trigger();

});
