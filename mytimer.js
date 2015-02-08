/**
 * Created by joe on 2/5/15.
 */

Mytimer = function(target) {
    this.target = target;
}

Mytimer.prototype.getMsec = function()
{
    var now = new Date();
    var target = this.target;
    if (now > target)
    {
        var temp;
        temp = target;
        target = now;
        now = temp;
    }
    return target - now;
}

Mytimer.prototype.stopped = function()
{
    return (new Date()) > this.target;
}

Mytimer.prototype.toString = function()
{
    var msec = this.getMsec();
    var hh = Math.floor(msec / 1000 / 60 / 60);
    msec -= hh * 1000 * 60 * 60;
    var mm = Math.floor(msec / 1000 / 60);
    msec -= mm * 1000 * 60;
    var ss = Math.floor(msec / 1000);
    msec -= ss * 1000;
    if (this.stopped())
        return "complete";
    return hh+":"+mm+":"+ss;
}

//Periodic = function (msec,target,periodic,callback)
//{
//    timer = new Mytimer(target);
//    setTimeout(function (){
//        if (timer.stopped())
//    },msec);
//    intId = setInterval(periodic(),msec);
//    callback();
//}