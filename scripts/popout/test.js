
    // test
    var  Pop = require('./pop.js');
    var tmpl = '<p>aaa</p>'
    window.pop = new Pop({
        'containerId' : 'test',
        'title' : '设置',
        'data' : {
            'title' : 'test',
            'content' : tmpl
        },
        'confirmHandle' : function () {
            alert('confirm');
        },
        'cancelHandle' : function () {
            alert('cancel');
        },
        'closeHandle' : function () {
            alert('close');
        }
    });