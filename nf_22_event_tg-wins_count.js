/*
  last edit:  2022-11-25 10:37 pm
  function:
    count all battles that fulfill the criteria listed under https://forum.navyfield.com/thread-2997-1-1.html
  
  usage:
    save codes below as a bookmark in any web-kit based browser first, run it by clicking the bookmark on https://forum.navyfield.com/plugin.php?id=battle
*/

javascript:(function(){
    Date.prototype.format = function(){
        const __PL = (nr, len = 2, chr = `0`) => `${nr}`.padStart(2, chr);
        return `${this.getFullYear()}-${__PL(this.getMonth()+1)}-\
${__PL(this.getDate())} ${__PL(this.getHours())}:\
${__PL(this.getMinutes())}:${__PL(this.getSeconds())}`
    };

    if ($ !== jQuery) $ = jQuery;
    if (localStorage.NF === undefined) localStorage.NF = JSON.stringify({
        timestamp: '2022-11-24 00:00:00',
        win: 0
    });
    let _data = JSON.parse(localStorage.NF);
    let _win = _data.win;
    let _timestamp = new Date(_data.timestamp);
    let _lasttimer = new Date(_data.timestamp);
    let _stop = false;

    function nf_parse(body){
        let rows = $(body).find('#bannedtable tr');
        if (!rows) return false;
        let _pagefirstdate = new Date(rows.first().children().first().text());
        if (_lasttimer >= _pagefirstdate){
            _stop = true;
            return false;
        }else stop = false;
        let _pagelastdate = new Date(rows.last().children().first().text());
        if (_lasttimer >= _pagelastdate) _stop = true;
          let _battles = rows.filter(function(){
            let _c = $(this).children();
            if (parseInt(_c.eq(2).text()) < 5000) return false;
            if (new Date(_c.first().text()) <= _lasttimer) return false;
            if (parseInt(_c.eq(4).text().match(/(\d{1,2})[^\d]+\d{1,2}/m)[1]) < 5) return false;
            return _c.last().text() == 'Victory' || _c.last().text() == '胜';;
        });
        if (_battles.length > 0){
            _win += $.unique(_battles.find("td:first").map(function(){return this.innerText})).length;
            if(_timestamp<_pagefirstdate)_timestamp =_pagefirstdate;
        }
    };

    let getHtml = function(url){
        let _html = null;
        $.ajax({
            'async': false,
            'type': "GET",
            'global': false,
            'dataType': 'html',
            'url': url,
            'success': function (data) {
                _html = data;
            }
        });
        return _html;
    };

    let _parsePage = function(page){
        let _html = getHtml(page);
        let _parser = new DOMParser();
        let _doc = _parser.parseFromString(_html, "text/html");
        nf_parse(_doc.body);
    };

    $($('div.pg strong').prevAll("a:not([class])").get().reverse()).each(function(i, _page){
        _parsePage($(_page).prop('href'));
        return !_stop;
    });
    nf_parse(document.body);

    if (!_stop){
        $('div.pg strong').nextAll("a:not([class])").each(function(i, _page){
            _parsePage($(_page).prop('href'));
            return !_stop;
        });
    };

    localStorage.NF = JSON.stringify({
        timestamp: _timestamp.format(),
        win: _win
    });
    window.alert(`final: win ${_win} before ${_timestamp.format()}`);
})()
