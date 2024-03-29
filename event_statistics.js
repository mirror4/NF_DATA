(function (){
    console.clear();

    Number.prototype.format = function (){
        return this.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    let getHtml = function(url){
        let _html = null;
        jQuery.ajax({
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

    let Battle = function(ele){
        let _c = jQuery(ele).children();
        this.date = new Date(_c.first().text());
        this.ship = _c.eq(1).text();
        this.attack = Number(_c.eq(2).text());
        this.killed = Number(_c.eq(3).text());
        this.duration = _c.eq(4).text().split(':').reduce((acc,time) => (60 * acc) + +time);
        this.outcome = /Victory|胜|勝/g.test(_c.eq(5).text());

        this.info = function(){
            console.log(`${this.date} - ${this.ship} - ${this.attack} - ${this.killed} - ${this.duration} - ${this.outcome} `);
        };

        this.isToday = function(){
            const today = new Date();
            if (today.toDateString() === this.date.toDateString()) {
                return true;
              }
            
              return false;
        }
    };

    let NAVYFIELD = function(body){
        this.battles = jQuery(body).find('#bannedtable tr').map(function(){
            return new Battle(this);
        });

        this.hasOtherDays = function(){
            return this.battles.filter(function(){return !this.isToday();}).length > 0;
        }

        this.showEvent = function(){
            //console.log(this.battles);return false;
            let attack = 0, killed = 0;
            let wins = 0, battles = 0;

            this.battles.each(function(){
                if (!this.isToday()) return;
                battles += 1;
                if (this.outcome) wins += 1 ;
                if (this.duration < 300) return;

                attack += this.attack;
                killed += this.killed;
            });

            console.log(`battles: ${wins}/${battles}(${(wins/battles * 100).toFixed(2)}%);total valid attack: ${attack.format()}, killed: ${killed}`);
            if (attack < 500000)
                console.log(`haven't got anything, need ${(500000-attack%500000).format()} attack to get one gift box`);
            else if (attack < 2500000)
                console.log(`got ${Math.floor(attack/500000)} box${attack>1000000?'es':''} already, need ${(500000-attack%500000).format()} attack to get another one`);
            else
                console.log('enough today.');
        }
    };

    let _stop = false;
    var battles = [];

    let _parsePage = function(page){
        if (_stop) return;
        let _html = getHtml(page);
        let _parser = new DOMParser();
        let _doc = _parser.parseFromString(_html, "text/html");
        let nf = new NAVYFIELD(_doc.body);
        jQuery.merge( battles, nf.battles );
        if (nf.hasOtherDays()) _stop = true;
    };

    jQuery(jQuery('div.pg strong').prevAll("a:not([class])").get().reverse()).each(function(i, _page){
        _parsePage(jQuery(_page).prop('href'));
        return !_stop;
    });


    let nf = new NAVYFIELD(document.body);
    jQuery.merge( battles, nf.battles );
    if (nf.hasOtherDays()) _stop = true;

    jQuery('div.pg strong').nextAll("a:not([class])").each(function(i, _page){
        _parsePage(jQuery(_page).prop('href'));
        return !_stop;
    });

    let showResult = function(){
        let attack = 0, killed = 0;
        let wins = 0, totalbattles = 0;

        jQuery(battles).each(function(){
            if (!this.isToday()) return;
            if (this.attack == 0) return;
            totalbattles += 1;
            if (this.outcome) wins += 1 ;
            if (this.duration < 300) return;

            attack += this.attack;
            killed += this.killed;
        });

        if (totalbattles == 0){
            showDialog('Go conquer the ocean NOW!', 'notice', 'Daily Statistics');
            return
        }else{
            let _msg = `battles: ${wins}/${totalbattles}(${(wins/totalbattles * 100).toFixed(2)}%)</br>total valid attacks: ${attack.format()}</br>killed: ${killed}`;
            showDialog(_msg, 'notice', 'Daily Statistics');
        }
    };

    showResult();
})()
