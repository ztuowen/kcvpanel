/**
 * Created by joe on 2/6/15.
 * Classes used to generate several major parts of the UI
 */

function updateList(id,preprocessedFiles,func) {
    var rowContainer = $(id).empty();

    preprocessedFiles.forEach(function (item) {
        $(rowContainer).append(func(item));
    });
}

function createRow(obj) {
    return $('<li>').text(JSON.stringify(obj));
}

function filterById(id,elem)
{
    return elem.api_id==id;
}

function findById(id,elems)
{
    return elems.filter(filterById.bind(null,id))[0];
}

Config = new function(){
    this.Sort = {
        name:"ID",
        dir:1
    };
};

Resource = new function(){
    this.field = ["石油","弹药","钢","铝","快速建造材","快速修复材","建造材料"];
    this.update = function() {
        var list = $('#resources-list').empty();
        for (var i = 0;i<Resource.field.length;++i) {
            $(list).append($('<li>').text(Resource.field[i]+":"+window.rawsvd.port.api_material[i].api_value));
        }
    }
};

MapArea = new function(){
    this.field = {
        NAME:"name"
    };
    this.fieldS = {
        NAME:function(mapA){return mapA.api_name;}
    };
};

Mission = new function(){
    this.field = {
        NAME:"name",
        AREA:"area",
        LNAME:"longname"
    };
    this.fieldS = {
        NAME:function(mission){return mission.api_name;},
        AREA:function(mission){return MapArea.fieldS.NAME(window.mst.api_mst_maparea[mission.api_maparea_id]);}
    };
};

Ship = new function(){
    // Defining fields of ship and their description
    this.field = {
        ID:"ID",
        NAME:"名字",
        STYPE:"舰种",
        RARE:'稀有',
        HP:"HP",
        LV:"LV",
        AFTERLV:"改造等级", //lv
        EXP2:"升级经验",
        COND:"状态",
        KARY:"火力",
        RAIS:"雷装",
        TAIK:"对空",
        SOUK:"装甲",
        KAIH:"回避",
        TAIS:"对潜",
        SAKU:"索敌",
        LUCK:"幸运"
    };

    // Return a value for sorting and reuse purposes
    this.fieldVal = {
        ID:function(ship){return ship.api_id;},
        NAME:function(ship){return ship.api_ship_id;}, //name
        HP:function(ship){return ship.api_nowhp/ship.api_maxhp;}, //hp
        STYPE:function(ship){return window.mst.api_mst_ship[Ship.fieldVal.NAME(ship)].api_stype;},
        RARE:function(ship){return window.mst.api_mst_ship[Ship.fieldVal.NAME(ship)].api_backs;},
        LV:function(ship){return ship.api_lv;}, //lv
        AFTERLV:function(ship){return window.mst.api_mst_ship[Ship.fieldVal.NAME(ship)].api_afterlv;}, //hp
        EXP2:function(ship){return ship.api_exp[1];}, //exp2nxt
        COND:function(ship){return ship.api_cond;}, //Cond
        KARY:function(ship){return ship.api_karyoku[0];}, //karyoku
        RAIS:function(ship){return ship.api_raisou[0];}, //raisou
        TAIK:function(ship){return ship.api_taiku[0];}, //taiku
        SOUK:function(ship){return ship.api_soukou[0];}, //soukou
        KAIH:function(ship){return ship.api_kaihi[0];}, //kaihi
        TAIS:function(ship){return ship.api_taisen[0];}, //taisen
        SAKU:function(ship){return ship.api_sakuteki[0];}, //sakuteki
        LUCK:function(ship){return ship.api_lucky[0];} //lucky
    };

    // Return a value for outputing as an jQuery Element
    this.fieldS = {
        ID:function(ship){return ship.api_id;},
        NAME:function(ship){return window.mst.api_mst_ship[Ship.fieldVal.NAME(ship)].api_name;}, //name
        HP:function(ship){ return healthBarGen(ship.api_nowhp,ship.api_maxhp);},//return ship.api_nowhp + "/" + ship.api_maxhp;}, //hp
        STYPE:function(ship){return window.mst.api_mst_stype[Ship.fieldVal.STYPE(ship)].api_name;},
        RARE:function(ship){return Ship.fieldVal.RARE(ship);},
        LV:function(ship){return ship.api_lv;}, //lv
        AFTERLV:function(ship){var lv=Ship.fieldVal.AFTERLV(ship); return lv==0?"-":lv;}, //lv
        EXP2:function(ship){return ship.api_exp[1];}, //exp2nxt
        COND:function(ship){return ship.api_cond;}, //Cond
        KARY:function(ship){return getRem(ship.api_karyoku);}, //karyoku
        RAIS:function(ship){return getRem(ship.api_raisou);}, //raisou
        TAIK:function(ship){return getRem(ship.api_taiku);}, //taiku
        SOUK:function(ship){return getRem(ship.api_soukou);}, //soukou
        KAIH:function(ship){return getRem(ship.api_kaihi);}, //kaihi
        TAIS:function(ship){return getRem(ship.api_taisen);}, //taisen
        SAKU:function(ship){return getRem(ship.api_sakuteki);}, //sakuteki
        LUCK:function(ship){return getRem(ship.api_lucky);} //lucky
    };

    // Comparing ship a, b with field name name and order ord(+1/-1)
    function cmpShip(name,ord,a,b)
    {
        return ord*(Ship.fieldVal[name](a)-Ship.fieldVal[name](b));
    }

    // Filters implemented if can support
    this.filter = {
        LOCK:function(args,ship){ return args == 0? true:(ship.api_locked>0);},
        LVRNG:function(args,ship){
            if (args[0]>0 && ship.api_lv<args[0])return false;
            if (args[1]>0 && ship.api_lv>args[1])return false;
            return true},
        STYPE:function(args,ship){
            return args.indexOf(Ship.fieldVal.STYPE(ship))>=0;}
    };

    function getRem(inp)
    {
        // todo affected by equipments?
        if (inp[0]>=inp[1])
            return inp[0]+"[M]";
        return inp[0]+"["+(inp[1]-inp[0])+"]";
    }

    function healthBarGen(a,b)
    {
        const color=["red","orange","yellow","green"];
        var col = color[Math.floor((a*4-1)/b)];
        var txt = a+"/"+b;
        var par = Math.floor(100*a/b);
        return $('<div class="healthbar"></div>').append($('<div style="background: '+col+';width:' +par+'%"></div>').text(txt));
    }

    this.filterShipList = function(ships,filters)
    {
        for (var i=0;i<filters.length;++i)
            ships = ships.filter(filters[i][0].bind(null,filters[i][1]));
        return ships;
    };

    this.createShipRow = function (cols,ship)
    {
        var tr = $('<tr>');
        for (var i = 0;i<cols.length;++i)
            tr.append($('<td>').append(Ship.fieldS[cols[i]](ship)));
        return tr;
    };

    this.init = function()
    {
        // update ship type names
        var shipsel = $("#ships-type");
        window.mst.api_mst_stype.forEach(function(stype){
                var item=$('<label></label>').append('<input type="checkbox" name="stype" value="'+stype.api_id+'" checked>')
                    .append($("<div class='boxed'></div>").text(stype.api_name));
                shipsel.append(item);
            }
        );

        // ship form init
        $("#ships-selector").on('change',function(event) {
            Ship.update();
        });
        var tmp = $("#ships-cols").empty();

        Object.getOwnPropertyNames(Ship.field).forEach(function(val){
            tmp.append($('<label></label>').append('<input type="checkbox" name="cols" value="'+val+'" checked>'+Ship.field[val]));
        });
    };

    this.update = function()
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
                    Config.Sort.dir=1;
                }
                else Config.Sort.dir=-Config.Sort.dir;
                Ship.update();
            }).bind(null,cols[i]));
            $(tr).append(col);
        }
        $(th).empty().append(tr);

        var sortf = cmpShip.bind(null,Config.Sort.name,Config.Sort.dir);

        // filtering
        //var ship=window.rawsvd.port.api_ship;
        var ship = Ship.filterShipList(window.rawsvd.port.api_ship,[
            [Ship.filter.STYPE,stypes],
            [Ship.filter.LOCK,lock],
            [Ship.filter.LVRNG,[lvmin,lvmax]]]);
        ship = ship.sort(sortf);
        updateList('#ships-list',ship,Ship.createShipRow.bind(null,cols));
    };
};

Timer = new function(){
    this.init = function(){
        setInterval(function(){
            try{
                Timer.update();
            }catch(err){
                // discard everything
            }
        },1000);
    };

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

    this.update = function()
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
    };
};

Deck = new function(){
    this.field = {
        NAME:"名称",
        MISS:"任务",
        SHIP:"舰船信息"
    };

    this.fieldVal = {
        NAME:function(deck){return deck.api_id;},
        MISS:function(deck){return deck.api_mission[1];},
        SHIP:function(deck){return 0;}
    };
    this.shipField=["NAME","STYPE","LV","EXP2","HP","COND"];
    function genShipList(ships)
    {
        var tmp = $('<table class="deckships">');
        ships.forEach(function(id) {
            if (id<0)
                return;
            var ship = findById(id,window.rawsvd.port.api_ship);
            var row = $('<tr>');
            Deck.shipField.forEach(function(field){
                $(row).append($('<td>').append(Ship.fieldS[field](ship)));
            });
            $(tmp).append(row);
        });
        return tmp;
    }

    function genMission(mission)
    {
        if (mission[1] == 0)
            return "无";
        var tmp=$('<ul style="padding: 0;list-style-type:none">');
        var mis = findById(mission[1],window.mst.api_mst_mission);
        $(tmp).append($('<li>').append(Mission.fieldS.AREA(mis)));
        $(tmp).append($('<li>').append(Mission.fieldS.NAME(mis)));
        $(tmp).append($('<li>').append(new Date(mission[2]).toLocaleTimeString()));
        return tmp;
    }
    this.fieldS = {
        NAME:function(deck){return deck.api_name;},
        MISS:function(deck){return genMission(deck.api_mission);},
        SHIP:function(deck){return genShipList(deck.api_ship);}
    };

    this.init = function()
    {
        var list=$('#decks-list').find(' thead').empty();
        var tmp=$('<tr>');
        Object.getOwnPropertyNames(Deck.field).forEach(function(val){
            tmp.append($('<th>').append(Deck.field[val]));
        });
        list.append(tmp);
        $(list).find("th:not(:last-child)").attr("rowspan",2);
        tmp=$('<table class="deckships">');
        Deck.shipField.forEach(function(field){
            $(tmp).append($('<th>').append(Ship.field[field]));
        });
        list.append(tmp);

    };
    function createDeckRow(deck,args)
    {
        var tmp = $('<tr>');
        Object.getOwnPropertyNames(Deck.field).forEach(function(val){
            tmp.append($('<td>').append(Deck.fieldS[val](deck)));
        });
        return tmp;
    }
    this.update = function()
    {
        var list=$('#decks-list').find(' tbody').empty();
        var args = 0;
        window.rawsvd.port.api_deck_port.forEach(function(deck){
            list.append(createDeckRow(deck,args));
        });
    };
};