// Main file, initializer

(function () {

    //Container for configurations

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

    // Extra options band init
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

    // Fires when load
    function listen() {
        var reloadButton = document.querySelector('.reload-button');
        reloadButton.addEventListener('click', kcDataReload);

        // This is where to init html only controller
        // Tabbing on the first line
        tabInit();
        // Extra options showing as buttons on the bottom bar
        exOpsInit();

        // load all data
        kcLoadMasterData();
    }

    // When the first json arrives - time to parse & load everyting
    // These init is only for pure form & logic generation
    // Shouldn't include user data .. etc.
    function contextFormInit()
    {
        Ship.init();
        Timer.init();
        Deck.init();
        Dock.init();
    }

    // (re)loading user data
    function kcDataReload()
    {
        //Used for extension
         chrome.runtime.sendMessage({
            command: "loadKCData",
            tabId: chrome.devtools.tabId
        }, updateJSON);
    }

    // Parsing master data
    function parseMasterData(json)
    {
        window.mst = json;
    }

    // load all data master & user
    function kcLoadMasterData()
    {

        //Used for extension
         chrome.runtime.sendMessage({
            command: "loadKCAPIData",
            tabId: chrome.devtools.tabId
        }, function (json)
        {
            parseMasterData(json);
            contextFormInit();
            kcDataReload();
        });
    }

    // User data relevant UI update
    // Anything coming form "loadKCData"
    function updateUI()
    {
        //document.getElementById('content').textContent = JSON.stringify(window.rawsvd);
        document.getElementById('name').textContent = window.rawsvd.port.api_basic.api_nickname;
        document.getElementById('lv').textContent = window.rawsvd.port.api_basic.api_level;

        Ship.update();

        Resource.update();

        Deck.update();

        Dock.update();

        updateList('#item-list',window.rawsvd.slot_item,createRow);
    }

    function updateJSON(json)
    {
        window.rawsvd = json;

        // Update the whole UI when new user data arrives
        updateUI();
    }

    // start listen when load
    window.addEventListener('load', listen);

    // Used for extension
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


