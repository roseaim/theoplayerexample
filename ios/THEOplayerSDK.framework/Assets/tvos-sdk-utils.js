THEOplayerUtils.instantiateTHEOplayer = function (playerID) {
    var element = getActiveDocument().createElement('div');
    THEOplayer.ChromelessPlayer(element, {
        uid: playerID
    });
};
THEOplayerUtils.loadTHEOplayerScript = function (path, playerID) {
    evaluateScripts([path], function (success) {
        if (success) {
            THEOplayerUtils.instantiateTHEOplayer(playerID);
            theoplayerScriptLoaded(playerID);
            //todo check this
            delete theoplayerScriptLoaded; // Delete  it to not pollute global
        }
    });
};
