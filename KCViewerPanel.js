// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

(function () {

    //Container for configurations
    Config={};
    Config.Sort = {};
    Config.Sort.name="ID";
    Config.Sort.dir=1;

	/* Added by Tong */
	// Tabbing initialization
    function tabInit() {
        $('#info>div:not(:first)').hide();
        $('#info-nav li:first').addClass('current');

        $('#info-nav li').click(function (event) {
            event.preventDefault();
            $('#info>div').hide();
            $('#info-nav .current').removeClass('current');
            $(this).addClass('current');

            var clicked = $(this).find('a').attr('href');
            $('#info ' + clicked).fadeIn('fast');
        });
    }

    function exOpsInit(){
        var tmp =$('.exoptions li.opspanel');


        $(tmp).each(function(){
            var clicked = $(this).find('a').attr('href');
            $(clicked).hide();
        });

        $(tmp).click(function(event) {
            event.preventDefault();
            var clicked = $(this).find('a').attr('href');
            if ($(this).hasClass('current')) {
                $(this).removeClass('current');
                $('.exoptionspanel ').fadeOut('fast');
            }else{
                $(clicked).slideDown('slow');
                var tmp = $('.exoptions li.opspanel.current');
                $(tmp).each(function(){
                    var clicked = $(this).find('a').attr('href');
                    $(clicked).fadeOut('fast');
                });
                $(tmp).removeClass('current');
                $(this).addClass('current');
            }
        });

    }

    function kcDataReload()
    {
        //Used for production
         chrome.runtime.sendMessage({
            command: "loadKCData",
            tabId: chrome.devtools.tabId
        }, updateJSON);
    }

    function parseMasterData(json)
    {
        window.mst = json;
        // update ship type names
        var shipsel = $("#ships-type");
        window.mst.api_mst_stype.forEach(function(stype){
                var item=$('<label></label>').append('<input type="checkbox" name="stype" value="'+stype.api_id+'" checked>')
                    .append($("<div class='boxed'></div>").text(stype.api_name));
                shipsel.append(item);
            }
        );
    }

    function kcLoadMasterData()
    {

        //Used for production
         chrome.runtime.sendMessage({
            command: "loadKCAPIData",
            tabId: chrome.devtools.tabId
        }, function (json)
        {
            parseMasterData(json);
            kcDataReload();
        });
    }

    function listen() {
        var reloadButton = document.querySelector('.reload-button');
        reloadButton.addEventListener('click', kcDataReload);
		
		tabInit();
        exOpsInit();
		
        var tmp = $("#ships-selector");
        tmp.submit(function( event ) {
            updateShips();
            event.preventDefault();
        });

        tmp = $("#ships-cols").empty();

        Object.getOwnPropertyNames(Ship.field).forEach(function(val){
            tmp.append($('<label></label>').append('<input type="checkbox" name="cols" value="'+val+'" checked>'+Ship.field[val]));
        });

        document.getElementById('ships-selector').addEventListener('change', function() {
            updateShips();
        }, false);
    }

    window.addEventListener('load', listen);

    function updateShips()
    {
        var cols = [];
        var stypes = [];
        var lock = 0;
        var lvmin = 0;
        var lvmax = 0;
        var shipsel = $("#ships-selector");
        shipsel.find("input[name=cols]:checkbox:checked").each(function() {
            cols.push($(this).val());
        });

        shipsel.find("input[name=stype]:checkbox:checked").each(function() {
            stypes.push(eval($(this).val()));
        });

        shipsel.find("input[name=locked]:checkbox:checked").each(function() {
            lock=1;
        });

        shipsel.find("input[name=lvmin]").each(function() {
            lvmin = eval($(this).val());
        });

        shipsel.find("input[name=lvmax]").each(function() {
            lvmax = eval($(this).val());
        });

        var th = $("#ships-head");
        var tr = $('<tr></tr>');
        for (var i = 0;i<cols.length;++i)
        {
            var col =$('<th></th>').text(Ship.field[cols[i]]);
            $(col).click((function(name)
            {
                if (Config.Sort.name!=name)
                {
                    Config.Sort.name=name;
                    dir=1;
                }
                else Config.Sort.dir=-Config.Sort.dir;
                updateShips();
            }).bind(null,cols[i]));
            $(tr).append(col);
        }
        $(th).empty().append(tr);

        var sortf = Ship.cmp.bind(null,Config.Sort.name,Config.Sort.dir);

        // filtering
        //var ship=window.rawsvd.port.api_ship;
        var ship = filterShipList(window.rawsvd.port.api_ship,[
            [Ship.filter.STYPE,stypes],
            [Ship.filter.LOCK,lock],
            [Ship.filter.LVRNG,[lvmin,lvmax]]]);
        ship = ship.sort(sortf);
        updateList('ships-list',ship,createShipRow.bind(null,cols));
    }

    function updateTimerList(tag,times)
    {
        $(tag).each(function()
        {
            $(this).empty();
            var rowContainer = this;
            times.forEach(function(item){
                $(rowContainer).append($("<li></li>").text(new Mytimer(item).toString()));
            });
        })
    }

    function updateTimers()
    {
        var times = [];
        window.rawsvd.port.api_deck_port.forEach(function(item){
            if (item.api_mission[0] != 0)
            times.push(item.api_mission[2]);
        });
        updateTimerList('.mission_timers',times);
        times = [];
        window.rawsvd.kdock.forEach(function(item){
            if (item.api_state > 0)
            times.push(item.api_complete_time);
        });
        updateTimerList('.build_timers',times);
        times = [];
        window.rawsvd.port.api_ndock.forEach(function(item){
            if (item.api_state > 0)
            times.push(item.api_complete_time);
        });
        updateTimerList('.repair_timers',times);
    }

    function updateResources() {
        var list = $('#resources-list').empty();
        for (var i = 0;i<Resource.field.length;++i) {
            $(list).append($('<li>').text(Resource.field[i]+":"+window.rawsvd.port.api_material[i].api_value));
        }
    }

    function updateDecks()
    {
        var list=$('#decks-list').empty();
        var args;
        list.append(createDeckRow(args));
    }

    function updateUI()
    {
        //document.getElementById('content').textContent = JSON.stringify(window.rawsvd);
        document.getElementById('name').textContent = window.rawsvd.port.api_basic.api_nickname;
        document.getElementById('lv').textContent = window.rawsvd.port.api_basic.api_level;

        updateShips();

        updateTimers();

        updateResources();

        updateList('decks-list',window.rawsvd.port.api_deck_port,createRow);

        updateList('kdock-list',window.rawsvd.kdock.filter(function(d){return d.api_state>-1;}),createRow);
        updateList('ndock-list',window.rawsvd.ndock.filter(function(d){return d.api_state>-1;}),createRow);
    }

    function updateJSON(json)
    {
        window.rawsvd = json;
        updateUI();
    }

    kcLoadMasterData();

    setInterval(function(){
        try{
            updateTimers(window.rawsvd.port.api_deck_port);
        }catch(err){
            // discard everything
        }
    },1000);

    function updateList(id,preprocessedFiles,func) {
        var rowContainer = document.getElementById(id);
        if (!rowContainer)
            return;
        rowContainer.innerHTML = '';

        preprocessedFiles.forEach(function (url) {
            rowContainer.appendChild(func(url));
        });
    }

    // Used for production
    // chrome extension trigger when data available
    var port= chrome.runtime.connect({name:"KCView"});
    port.onMessage.addListener(function(request, sender, callback) {
        if (request.command == 'notifyNewKCData')
        {
            Console.warn("Data available reloading");
            kcDataReload();
        }
    });
})();


