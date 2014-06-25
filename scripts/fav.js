define(function (require, exports, module) {

    var template = require('../templates/fav.html');
    var View = require('./view');
    var favItem = require('./fav-item');
    var data = require('./data/fav');

    var fav = View.extend({

        // 本 view 的名称，可以理解为 first name 和 last name
        // first name : <div tab-wraper data-name="{first_name}">
        // last  name : <div tab-nav data-name="{last_name}">
        iname: ['home', 'fav'],

        template: _.template(template),

        ds: data,

        ViewItem: favItem,

        events: {
            'click .filter' : 'goFilter',
            'click .items-recmds .prev' : 'slideControl',
            'click .items-recmds .next' : 'slideControl'
        },

        _inFilterMode : false,

        filter : {
            inSalesPromotion : true,
            avaliable : true
        },

        goFilter : function (e) {
            if (e.target.checked) {
                this._inFilterMode = true;
                this.render();
                this._dontLoad = true;
            } else {
                this._inFilterMode = false;
                this.render();
                this._dontLoad = false;
            }
        },

        slideControl : function (e) {
            var $btn = $(e.target);
            if ($btn.hasClass('prev-disable') || $btn.hasClass('next-disable')) {
                return;
            }

            var type = $btn.data('btn-type');

            var curContainer = $btn.parents('.items-recmds');
            var curContents = curContainer.find('.recom-contents');

            var length = curContents.find('.recom-content').length;
            var cur = curContainer.data('curInx') || 0;

            cur = ( type === 'next' ? cur + 3 : cur - 3);
            curContainer.find('.prev').toggleClass('prev-disable', cur === 0);
            curContainer.find('.next').toggleClass('next-disable', cur >= length - 3);

            curContainer.data('curInx', cur);
            curContents.animate({
                left : ((type === 'next') ? "-=" : "+=" ) + 3*130
            }, 500);

        }

    });
    return fav;
});