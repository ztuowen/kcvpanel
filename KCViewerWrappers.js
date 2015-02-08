/**
 * Created by joe on 2/6/15.
 * Classes used to generate columns
 */

function createRow(url) {
    var li = document.createElement('li');
    li.textContent = JSON.stringify(url);
    return li;
}

function progressBarGen(a,b)
{
    const color=["red","orange","yellow","green"];
    var col = color[Math.floor((a*4-1)/b)];
    var txt = a+"/"+b;
    var par = Math.floor(100*a/b);
    var tmp = $('<div class="healthbar"></div>').append($('<div style="background: '+col+';width:' +par+'%"></div>').text(txt));
    return tmp.get(0).outerHTML;
}

function getRem(inp)
{
    // todo affected by equipments
    if (inp[0]>=inp[1])
        return inp[0]+"[M]";
    return inp[0]+"["+(inp[1]-inp[0])+"]";
}

function createCol(str)
{
    var col = document.createElement('td');
    col.innerHTML=str;
    return col;
}

function Resource(){}

Resource.field = ["石油","弹药","钢","铝","快速建造材","快速修复材","建造材料"];

function Ship(){}

Ship.field = {
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
}

function filterById(id,elem)
{
    return elem.api_id==id;
}

function findById(id,elems)
{
    return elems.filter(filterById.bind(null,id))[0];
}

Ship.fieldVal = {
    ID:function(ship){return ship.api_id;},
    NAME:function(ship){return ship.api_ship_id;}, //name
    HP:function(ship){return ship.api_nowhp/ship.api_maxhp;}, //hp
    STYPE:function(ship){return findById(Ship.fieldVal.NAME(ship),window.mst.api_mst_ship).api_stype;},
    RARE:function(ship){return findById(Ship.fieldVal.NAME(ship),window.mst.api_mst_ship).api_backs;},
    LV:function(ship){return ship.api_lv;}, //lv
    AFTERLV:function(ship){return findById(Ship.fieldVal.NAME(ship),window.mst.api_mst_ship).api_afterlv;}, //hp
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
}

Ship.cmp = function(name,ord,a,b)
{
    return ord*(Ship.fieldVal[name](a)-Ship.fieldVal[name](b));
}

Ship.fieldS = {
    ID:function(ship){return ship.api_id;},
    NAME:function(ship){return findById(Ship.fieldVal.NAME(ship),window.mst.api_mst_ship).api_name;}, //name
    HP:function(ship){ return progressBarGen(ship.api_nowhp,ship.api_maxhp);},//return ship.api_nowhp + "/" + ship.api_maxhp;}, //hp
    STYPE:function(ship){return findById(Ship.fieldVal.STYPE(ship),window.mst.api_mst_stype).api_name;},
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
}

Ship.filter = {
    LOCK:function(args,ship){ return args == 0? true:(ship.api_locked>0);},
    LVRNG:function(args,ship){
        if (args[0]>0 && ship.api_lv<args[0])return false;
        if (args[1]>0 && ship.api_lv>args[1])return false;
        return true},
    STYPE:function(args,ship){
        return args.indexOf(Ship.fieldVal.STYPE(ship))>=0;}
}

function filterShipList(ships,filters)
{
    for (var i=0;i<filters.length;++i)
        ships = ships.filter(filters[i][0].bind(null,filters[i][1]));
    return ships;
}

function createShipRow(cols,ship)
{
    var tr = document.createElement('tr');
    for (var i = 0;i<cols.length;++i)
        tr.appendChild(createCol(Ship.fieldS[cols[i]](ship)));
    return tr;
}

function createDeckRow(args)
{
}