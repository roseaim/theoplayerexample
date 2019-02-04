/// <reference path="chromecast-bridge.d.ts" /> // Fix for WebStorm
var chrome;
(function (chrome) {
    var cast;
    (function (cast) {
        function arrayRemove(array, element) {
            var index = array.indexOf(element);
            if (index !== -1) {
                array.splice(index, 1);
            }
        }
        cast.isAvailable = false;
        function chromecastNotifyApiAvailable() {
            if (!cast.isAvailable) {
                cast.isAvailable = true;
                if (typeof __onGCastApiAvailable === 'function') {
                    __onGCastApiAvailable(true);
                }
            }
        }
        cast.chromecastNotifyApiAvailable = chromecastNotifyApiAvailable;
        function initialize(apiConfig, successCallback, errorCallback) {
            var actualSessionSuccessCallback = function (receiverName) {
                native.currentSession.receiver.friendlyName = receiverName;
                native.currentSession.status = SessionStatus.CONNECTED;
                apiConfig.sessionListener(native.currentSession);
            };
            var bridgeApiConfig = {
                autoJoinPolicy: apiConfig.autoJoinPolicy,
                defaultActionPolicy: apiConfig.defaultActionPolicy,
                receiverListener: chromecastListenerCallbackHandler.register(apiConfig.receiverListener),
                sessionListener: chromecastListenerCallbackHandler.register(actualSessionSuccessCallback),
                sessionRequest: {
                    appId: apiConfig.sessionRequest.appId
                }
            };
            try {
                var param = bridgeApiConfig;
                var callbackId = chromecastCallbackHandler.register(successCallback, errorCallback);
                param["callbackId"] = callbackId;
                webkit.messageHandlers.chromecastBridgeInitialize.postMessage(JSON.stringify(param));
            }
            catch (err) {
                console.log('Error while trying chromecastBridgeInitialize.The native context does not exist.', err);
            }
        }
        cast.initialize = initialize;
        ;
        function requestSession(givenSuccessCallback, errorCallback, sessionRequest) {
            var actualSuccessCallback = function (receiverName) {
                native.currentSession.receiver.friendlyName = receiverName;
                native.currentSession.status = SessionStatus.CONNECTED;
                givenSuccessCallback(native.currentSession);
            };
            var successCallbackId = chromecastCallbackHandler.register(actualSuccessCallback, errorCallback);
            try {
                webkit.messageHandlers.chromecastBridgeRequestSession.postMessage(successCallbackId);
            }
            catch (err) {
                console.log('Error while trying chromecastBridgeRequestSession.The native context does not exist.', err);
            }
        }
        cast.requestSession = requestSession;
        ;
        function addReceiverActionListener(listener) {
            var actualListener = function (receiverName, action) {
                listener(new Receiver(receiverName), action);
            };
            var listenerId = chromecastListenerCallbackHandler.register(actualListener);
            try {
                webkit.messageHandlers.chromecastBridgeAddReceiverActionListener.postMessage(listenerId);
            }
            catch (err) {
                console.log('Error while trying chromecastBridgeAddReceiverActionListener. The native context does not exist.', err);
            }
        }
        cast.addReceiverActionListener = addReceiverActionListener;
        var Native = /** @class */ (function () {
            function Native() {
                this._currentSession = new Session(new Receiver(""));
            }
            Object.defineProperty(Native.prototype, "currentSession", {
                get: function () {
                    return this._currentSession;
                },
                set: function (session) {
                    this._currentSession = session;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Native.prototype, "currentMedia", {
                get: function () {
                    return this._currentMedia;
                },
                set: function (media) {
                    this._currentMedia = media;
                },
                enumerable: true,
                configurable: true
            });
            return Native;
        }());
        cast.Native = Native;
        var ApiConfig = /** @class */ (function () {
            function ApiConfig(sessionRequest, sessionListener, receiverListener, autoJoinPolicy, defaultActionPolicy) {
                this.sessionRequest = sessionRequest;
                this.sessionListener = sessionListener;
                this.receiverListener = receiverListener;
                this.autoJoinPolicy = autoJoinPolicy;
                this.defaultActionPolicy = defaultActionPolicy;
            }
            return ApiConfig;
        }());
        cast.ApiConfig = ApiConfig;
        var Error = /** @class */ (function () {
            function Error(code, description, details) {
                this.code = code;
                this.description = description;
                this.details = details;
            }
            ;
            return Error;
        }());
        cast.Error = Error;
        var Image = /** @class */ (function () {
            function Image(url) {
                this.url = url;
            }
            ;
            return Image;
        }());
        cast.Image = Image;
        var Receiver = /** @class */ (function () {
            function Receiver(friendlyName) {
                this.friendlyName = friendlyName;
                this.volume = new Volume();
            }
            ;
            return Receiver;
        }());
        cast.Receiver = Receiver;
        var ReceiverDisplayStatus = /** @class */ (function () {
            function ReceiverDisplayStatus(statusText, appImages) {
                this.statusText = statusText;
                this.appImages = appImages;
            }
            ;
            return ReceiverDisplayStatus;
        }());
        cast.ReceiverDisplayStatus = ReceiverDisplayStatus;
        var Session = /** @class */ (function () {
            function Session(receiver, status) {
                if (status === void 0) { status = SessionStatus.DISCONNECTED; }
                this.receiver = receiver;
                this.status = status;
                this._addMediaListeners = [];
            }
            Object.defineProperty(Session.prototype, "media", {
                get: function () {
                    // TODO: fix this if multiple media elements are possible
                    if (!!native.currentMedia) {
                        return [native.currentMedia];
                    }
                    else {
                        return [];
                    }
                },
                enumerable: true,
                configurable: true
            });
            Session.prototype.addMediaListener = function (listener) {
                this._addMediaListeners.push(listener);
            };
            Session.prototype.removeMediaListener = function (listener) {
                arrayRemove(this._addMediaListeners, listener);
            };
            Session.prototype.addMessageListener = function (nameSpace, listener) {
                //this.nativeSession.addMessageListener(nameSpace, chromecastListenerCallbackHandler.register(listener)); //TODO test
                try {
                    var param = {};
                    param["nameSpace"] = nameSpace;
                    var callbackId = chromecastListenerCallbackHandler.register(listener);
                    param["callbackId"] = callbackId;
                    webkit.messageHandlers.sessionBridgeAddMessageListener.postMessage(JSON.stringify(param));
                }
                catch (err) {
                    console.log('Error while trying sessionBridgeAddMessageListener.The native context does not exist.', err);
                }
            };
            ;
            Session.prototype.addUpdateListener = function (listener) {
                //this.nativeSession.addUpdateListener(chromecastListenerCallbackHandler.register(listener))
                try {
                    var callbackId = chromecastListenerCallbackHandler.register(listener);
                    webkit.messageHandlers.sessionBridgeAddUpdateListener.postMessage(callbackId);
                }
                catch (err) {
                    console.log('Error while trying sessionBridgeAddUpdateListener.The native context does not exist.', err);
                }
            };
            ;
            Session.prototype.loadMedia = function (loadRequest, givenSuccessCallback, errorCallback) {
                //TODO this is used in: ChromecastPlayer.ts: this._session.loadMedia(loadRequest, (media : THEOCastMedia_) => {
                //TODO make media object
                var givenLoadRequest = loadRequest;
                var actualSuccessCallback = function (duration) {
                    if (!!native.currentMedia) {
                        native.currentMedia.onReplaced();
                    }
                    native.currentMedia = new media.Media(givenLoadRequest, duration);
                    givenSuccessCallback(native.currentMedia);
                    chromecastCallbackHandler.unRegister(successCallbackId);
                };
                var successCallbackId = chromecastCallbackHandler.register(actualSuccessCallback, errorCallback);
                try {
                    var param = {};
                    param["loadRequest"] = loadRequest;
                    param["callbackId"] = successCallbackId;
                    webkit.messageHandlers.sessionBridgeLoadMedia.postMessage(JSON.stringify(param));
                }
                catch (err) {
                    console.log('Error while trying sessionBridgeLoadMedia. The native context does not exist.', err);
                }
            };
            ;
            Session.prototype.callAddMediaListeners = function (media) {
                for (var _i = 0, _a = this._addMediaListeners; _i < _a.length; _i++) {
                    var listener = _a[_i];
                    listener(media);
                }
            };
            Session.prototype.sendMessage = function (nameSpace, message, successCallback, errorCallback) {
                //this is used in: ChromecastForwarder.ts: this._session.sendMessage(nameSpace, message, succesHandler, failureHandler);
                //this.nativeSession.sendMessage(nameSpace, JSON.stringify(message), chromecastCallbackHandler.register(successCallback, errorCallback))
                try {
                    var param = {};
                    param["nameSpace"] = nameSpace;
                    param["message"] = JSON.stringify(message);
                    var callbackId = chromecastCallbackHandler.register(successCallback, errorCallback);
                    param["callbackId"] = callbackId;
                    webkit.messageHandlers.sessionBridgeSendMessage.postMessage(JSON.stringify(param));
                }
                catch (err) {
                    console.log('Error while trying sessionBridgeSendMessage. The native context does not exist.', err);
                }
            };
            ;
            Session.prototype.setReceiverMuted = function (muted, successCallback, errorCallback) {
                //this is used in: ChromecastPlayer.ts: this._session.setReceiverMuted(muted, () => {
                //this.nativeSession.setReceiverMuted(muted, chromecastCallbackHandler.register(successCallback, errorCallback))
                try {
                    var param = {};
                    param["muted"] = muted;
                    var callbackId = chromecastCallbackHandler.register(successCallback, errorCallback);
                    param["callbackId"] = callbackId;
                    webkit.messageHandlers.sessionBridgeSetReceiverMuted.postMessage(JSON.stringify(param));
                }
                catch (err) {
                    console.log('Error while trying sessionBridgeSetReceiverMuted. The native context does not exist.', err);
                }
            };
            ;
            Session.prototype.setReceiverVolumeLevel = function (newLevel, successCallback, errorCallback) {
                /*
                On IOS, the receiver volume is set by the controls of the device and not by our player.
                The volume button only serves as a mute/unmute button.
                Therefore, we keep the volume of THEOplayer fixed at 1.
                If this method would actually call through to the native ChromecastSDK,
                the volume would be set to max every time this method is called. (THEO-1871)
                */
                successCallback();
            };
            ;
            Session.prototype.queueLoad = function (queueLoadRequest, onSuccess, onError) {
                // Binded but not actually used by CAF
                return;
            };
            ;
            Session.prototype.stop = function (successCallback, errorCallback) {
                //this is used in: ChromecastController.ts: this._session.stop(this._onStopAppSuccess, this._onError)
                //this.nativeSession.stop(chromecastCallbackHandler.register(successCallback, errorCallback))
                try {
                    var param = {};
                    param["callbackId"] = chromecastCallbackHandler.register(successCallback, errorCallback);
                    webkit.messageHandlers.sessionBridgeStop.postMessage(JSON.stringify(param));
                }
                catch (err) {
                    console.log('Error while trying sessionBridgeStop. The native context does not exist.', err);
                }
            };
            ;
            Session.prototype.removeMessageListener = function (nameSpace, listener) {
                //this is used in: ChromecastForwarder.ts: this._session.removeMessageListener(ChromecastForwarder_.THEOPLAYER_NAMESPACE, this._messageListener);
            };
            Session.prototype.removeUpdateListener = function (listener) {
                //this is used in: ChromecastForwarder.ts: this._session.removeUpdateListener(this._sessionUpdateListener);
            };
            return Session;
        }());
        cast.Session = Session;
        var SenderApplication = /** @class */ (function () {
            function SenderApplication(platform) {
                this.platform = platform;
            }
            ;
            return SenderApplication;
        }());
        cast.SenderApplication = SenderApplication;
        var SessionRequest = /** @class */ (function () {
            function SessionRequest(appId, capabilities, timeout) {
                this.appId = appId;
                this.capabilities = capabilities;
            }
            ;
            return SessionRequest;
        }());
        cast.SessionRequest = SessionRequest;
        var Volume = /** @class */ (function () {
            function Volume(level, muted) {
                if (level === void 0) { level = 1; }
                if (muted === void 0) { muted = false; }
                this._level = level;
                this._muted = muted;
            }
            ;
            Object.defineProperty(Volume.prototype, "muted", {
                get: function () {
                    return this._muted;
                },
                set: function (newMuted) {
                    this._muted = newMuted;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Volume.prototype, "level", {
                get: function () {
                    return this._level;
                },
                set: function (newLevel) {
                    this._level = newLevel;
                },
                enumerable: true,
                configurable: true
            });
            return Volume;
        }());
        cast.Volume = Volume;
        var AutoJoinPolicy = /** @class */ (function () {
            function AutoJoinPolicy() {
            }
            AutoJoinPolicy.TAB_AND_ORIGIN_SCOPED = 'TAB_AND_ORIGIN_SCOPED';
            AutoJoinPolicy.ORIGIN_SCOPED = 'ORIGIN_SCOPED';
            AutoJoinPolicy.PAGE_SCOPED = 'PAGE_SCOPED';
            return AutoJoinPolicy;
        }());
        cast.AutoJoinPolicy = AutoJoinPolicy;
        var Capability = /** @class */ (function () {
            function Capability() {
            }
            Capability.VIDEO_OUT = 'VIDEO_OUT';
            Capability.AUDIO_OUT = 'AUDIO_OUT';
            Capability.VIDEO_IN = 'VIDEO_IN';
            Capability.AUDIO_IN = 'AUDIO_IN';
            return Capability;
        }());
        cast.Capability = Capability;
        var DefaultActionPolicy = /** @class */ (function () {
            function DefaultActionPolicy() {
            }
            DefaultActionPolicy.CREATE_SESSION = 'CREATE_SESSION';
            DefaultActionPolicy.CAST_THIS_TAB = 'CAST_THIS_TAB';
            return DefaultActionPolicy;
        }());
        cast.DefaultActionPolicy = DefaultActionPolicy;
        var ErrorCode = /** @class */ (function () {
            function ErrorCode() {
            }
            ErrorCode.CANCEL = 'CANCEL';
            ErrorCode.TIMEOUT = 'TIMEOUT';
            ErrorCode.API_NOT_INITIALIZED = 'API_NOT_INITIALIZED';
            ErrorCode.INVALID_PARAMETER = 'INVALID_PARAMETER';
            ErrorCode.EXTENSION_NOT_COMPATIBLE = 'EXTENSION_NOT_COMPATIBLE';
            ErrorCode.EXTENSION_MISSING = 'EXTENSION_MISSING';
            ErrorCode.RECEIVER_UNAVAILABLE = 'RECEIVER_UNAVAILABLE';
            ErrorCode.SESSION_ERROR = 'SESSION_ERROR';
            ErrorCode.CHANNEL_ERROR = 'CHANNEL_ERROR';
            ErrorCode.LOAD_MEDIA_FAILED = 'LOAD_MEDIA_FAILED';
            return ErrorCode;
        }());
        cast.ErrorCode = ErrorCode;
        var ReceiverAvailability = /** @class */ (function () {
            function ReceiverAvailability() {
            }
            ReceiverAvailability.AVAILABLE = 'AVAILABLE';
            ReceiverAvailability.UNAVAILABLE = 'UNAVAILABLE';
            return ReceiverAvailability;
        }());
        cast.ReceiverAvailability = ReceiverAvailability;
        var ReceiverType = /** @class */ (function () {
            function ReceiverType() {
            }
            ReceiverType.CAST = 'CAST';
            ReceiverType.HANGOUT = 'HANGOUT';
            ReceiverType.CUSTOM = 'CUSTOM';
            return ReceiverType;
        }());
        cast.ReceiverType = ReceiverType;
        var SenderPlatform = /** @class */ (function () {
            function SenderPlatform() {
            }
            SenderPlatform.CHROME = 'CHROME';
            SenderPlatform.IOS = 'IOS';
            SenderPlatform.ANDROID = 'ANDROID';
            return SenderPlatform;
        }());
        cast.SenderPlatform = SenderPlatform;
        var SessionStatus = /** @class */ (function () {
            function SessionStatus() {
            }
            SessionStatus.CONNECTED = 'CONNECTED';
            SessionStatus.DISCONNECTED = 'DISCONNECTED';
            SessionStatus.STOPPED = 'STOPPED';
            return SessionStatus;
        }());
        cast.SessionStatus = SessionStatus;
        var media;
        (function (media_1) {
            var GenericMediaMetadata = /** @class */ (function () {
                function GenericMediaMetadata() {
                }
                ;
                return GenericMediaMetadata;
            }());
            media_1.GenericMediaMetadata = GenericMediaMetadata;
            var MetadataType;
            (function (MetadataType) {
                MetadataType[MetadataType["MOVIE"] = 0] = "MOVIE";
                MetadataType[MetadataType["MUSIC_TRACK"] = 1] = "MUSIC_TRACK";
                MetadataType[MetadataType["TV_SHOW"] = 2] = "TV_SHOW";
                MetadataType[MetadataType["GENERIC"] = 3] = "GENERIC";
            })(MetadataType = media_1.MetadataType || (media_1.MetadataType = {}));
            var EditTracksInfoRequest = /** @class */ (function () {
                function EditTracksInfoRequest(activeTrackIds) {
                    this.activeTrackIds = activeTrackIds;
                }
                return EditTracksInfoRequest;
            }());
            media_1.EditTracksInfoRequest = EditTracksInfoRequest;
            var GetStatusRequest = /** @class */ (function () {
                function GetStatusRequest() {
                }
                return GetStatusRequest;
            }());
            media_1.GetStatusRequest = GetStatusRequest;
            var LoadRequest = /** @class */ (function () {
                function LoadRequest(media) {
                    this.media = media;
                }
                ;
                return LoadRequest;
            }());
            media_1.LoadRequest = LoadRequest;
            var Media = /** @class */ (function () {
                function Media(loadRequest, duration) {
                    this._currentTime = 0;
                    this._cachedDate = performance.now();
                    this._supportedMediaCommands = [];
                    this.updateListeners = [];
                    this.loadRequest = loadRequest;
                    this._media = new MediaInfo(loadRequest.media.contentId, loadRequest.media.contentType, duration);
                    this._media.customData = loadRequest.media.customData;
                }
                Media.prototype.onReplaced = function () {
                    this._playerState = PlayerState.IDLE;
                    this.callUpdateListenersAfterReplace();
                };
                Media.prototype.callUpdateListenersAfterReplace = function () {
                    for (var _i = 0, _a = this.updateListeners; _i < _a.length; _i++) {
                        var listener = _a[_i];
                        listener.call(false);
                    }
                };
                Object.defineProperty(Media.prototype, "playbackRate", {
                    get: function () {
                        return this._playbackRate;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Media.prototype, "activeTrackIds", {
                    get: function () {
                        return this._activeTrackIds;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Media.prototype, "customData", {
                    get: function () {
                        return {
                            sourceDescription: this._sourceDescription,
                            buffers: this._buffers
                        };
                    },
                    enumerable: true,
                    configurable: true
                });
                ;
                Object.defineProperty(Media.prototype, "idleReason", {
                    get: function () {
                        return this._idleReason;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Media.prototype, "media", {
                    get: function () {
                        return this._media;
                    },
                    enumerable: true,
                    configurable: true
                });
                ;
                Object.defineProperty(Media.prototype, "playerState", {
                    get: function () {
                        return this._playerState;
                    },
                    set: function (value) {
                        if (value === this._playerState) {
                            return;
                        }
                        this.currentTime = this.getEstimatedTime();
                        this._playerState = value;
                    },
                    enumerable: true,
                    configurable: true
                });
                ;
                Object.defineProperty(Media.prototype, "currentTime", {
                    get: function () {
                        return this._currentTime;
                    },
                    set: function (value) {
                        this._currentTime = value;
                        this._cachedDate = performance.now();
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Media.prototype, "supportedMediaCommands", {
                    get: function () {
                        return this._supportedMediaCommands;
                    },
                    set: function (mediaCommands) {
                        this._supportedMediaCommands = mediaCommands;
                    },
                    enumerable: true,
                    configurable: true
                });
                Media.prototype.updateMediaStatus = function (parsedData) {
                    var _this = this;
                    if (parsedData["tracks"]) {
                        var mergedTracks_1 = [];
                        parsedData["tracks"].audioTracks.map(function (track) { return mergedTracks_1.push(_this.createCustomTrack(track, TrackType.AUDIO)); });
                        parsedData["tracks"].videoTracks.map(function (track) { return mergedTracks_1.push(_this.createCustomTrack(track, TrackType.VIDEO)); });
                        parsedData["tracks"].textTracks.map(function (track) { return mergedTracks_1.push(_this.createCustomTrack(track, TrackType.TEXT)); });
                        this._media.tracks = mergedTracks_1;
                    }
                    if (parsedData["sourceDescription"]) {
                        this._sourceDescription = parsedData["sourceDescription"];
                    }
                    if (parsedData["buffers"]) {
                        this._buffers = parsedData["buffers"];
                    }
                    if (parsedData["activeTrackIds"]) {
                        this._activeTrackIds = parsedData["activeTrackIds"];
                    }
                    if (parsedData["playbackRate"]) {
                        this._playbackRate = parsedData["playbackRate"];
                    }
                    if (parsedData["idleReason"]) {
                        this._idleReason = parsedData["idleReason"];
                    }
                    if (parsedData["playerState"]) {
                        this.playerState = parsedData["playerState"];
                    }
                };
                Media.prototype.createCustomTrack = function (track, type) {
                    return { 'type': type, 'customData': track, 'trackId': track.uid, 'language': track.language, 'name': track.label };
                };
                Media.prototype.addUpdateListener = function (listener) {
                    //this.nativeMedia.addUpdateListener(chromecastListenerCallbackHandler.register(listener));
                    try {
                        this.updateListeners.push(listener);
                        var callbackId = chromecastListenerCallbackHandler.register(listener);
                        webkit.messageHandlers.mediaBridgeAddUpdateListener.postMessage(callbackId);
                    }
                    catch (err) {
                        console.log('Error while trying mediaBridgeAddUpdateListener.The native context does not exist.', err);
                    }
                };
                ;
                Media.prototype.editTracksInfo = function (editTracksInfoRequest, successCallback, errorCallback) {
                    //this.nativeMedia.setActiveTrackIds(editTracksInfoRequest.activeTrackIds, chromecastCallbackHandler.register(successCallback, errorCallback)); //TODO implement in public static JAVA : string = 'JAVA';
                    try {
                        var param = {};
                        param["activeTrackIds"] = editTracksInfoRequest.activeTrackIds;
                        param["callbackId"] = chromecastCallbackHandler.register(successCallback, errorCallback);
                        webkit.messageHandlers.mediaBridgeSetActiveTrackIds.postMessage(JSON.stringify(param));
                    }
                    catch (err) {
                        console.log('Error while trying mediaBridgeSetActiveTrackIds.The native context does not exist.', err);
                    }
                };
                ;
                Media.prototype.getDurationSinceLastDate = function () {
                    if (this._playerState === PlayerState.PLAYING) {
                        return performance.now() - this._cachedDate;
                    }
                    return 0;
                };
                Media.prototype.getEstimatedTime = function () {
                    var unclampedEstimatedTime = this._currentTime + this.getDurationSinceLastDate() / 1E3 * this.playbackRate;
                    var upperBound = this.media && this.media.duration || Infinity;
                    var clampedEstimatedTime = Math.min(Math.max(0, unclampedEstimatedTime), upperBound);
                    return clampedEstimatedTime;
                };
                ;
                Media.prototype.pause = function (pauseRequest, successCallback, errorCallback) {
                    //this.nativeMedia.pause(chromecastCallbackHandler.register(successCallback, errorCallback));
                    try {
                        var callbackId = chromecastCallbackHandler.register(successCallback, errorCallback);
                        webkit.messageHandlers.mediaBridgePause.postMessage(callbackId);
                    }
                    catch (err) {
                        console.log('Error while trying mediaBridgePause.The native context does not exist.', err);
                    }
                };
                ;
                Media.prototype.play = function (playRequest, successCallback, errorCallback) {
                    // this.nativeMedia.play(chromecastCallbackHandler.register(successCallback, errorCallback));
                    try {
                        var callbackId = chromecastCallbackHandler.register(successCallback, errorCallback);
                        webkit.messageHandlers.mediaBridgePlay.postMessage(callbackId);
                    }
                    catch (err) {
                        console.log('Error while trying mediaBridgePlay.The native context does not exist.', err);
                    }
                };
                ;
                Media.prototype.removeUpdateListener = function (listener) {
                    //this.nativeMedia.removeUpdateListener(chromecastListenerCallbackHandler.lookup(listener));
                    try {
                        arrayRemove(this.updateListeners, listener);
                        var callbackId = chromecastListenerCallbackHandler.lookup(listener);
                        webkit.messageHandlers.mediaBridgeRemoveUpdateListener.postMessage(callbackId);
                        chromecastListenerCallbackHandler.unRegister(listener);
                    }
                    catch (err) {
                        console.log('Error while trying mediaBridgeRemoveUpdateListener.The native context does not exist.', err);
                    }
                };
                ;
                Media.prototype.seek = function (seekRequest, successCallback, errorCallback) {
                    // this.nativeMedia.seek(seekRequest.currentTime, chromecastCallbackHandler.register(successCallback, errorCallback));
                    try {
                        var param = {};
                        param["currentTime"] = seekRequest.currentTime;
                        param["callbackId"] = chromecastCallbackHandler.register(successCallback, errorCallback);
                        webkit.messageHandlers.mediaBridgeSeek.postMessage(JSON.stringify(param));
                    }
                    catch (err) {
                        console.log('Error while trying mediaBridgeSeek.The native context does not exist.', err);
                    }
                };
                ;
                Media.prototype.stop = function (stopRequest, successCallback, errorCallback) {
                    // this.nativeMedia.stop(chromecastCallbackHandler.register(successCallback, errorCallback));
                    try {
                        var callbackId = chromecastCallbackHandler.register(successCallback, errorCallback);
                        webkit.messageHandlers.mediaBridgeStop.postMessage(callbackId);
                    }
                    catch (err) {
                        console.log('Error while trying mediaBridgeStop.The native context does not exist.', err);
                    }
                };
                ;
                return Media;
            }());
            media_1.Media = Media;
            var MediaInfo = /** @class */ (function () {
                function MediaInfo(contentId, contentType, duration) {
                    this.contentId = contentId;
                    this.contentType = contentType;
                    this._duration = duration;
                }
                ;
                Object.defineProperty(MediaInfo.prototype, "tracks", {
                    get: function () {
                        return this._tracks;
                    },
                    set: function (tracks) {
                        this._tracks = tracks;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(MediaInfo.prototype, "duration", {
                    get: function () {
                        return this._duration;
                    },
                    set: function (duration) {
                        this._duration = duration;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(MediaInfo.prototype, "metadata", {
                    get: function () {
                        return this._metadata;
                    },
                    set: function (metadata) {
                        this._metadata = metadata;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(MediaInfo.prototype, "customData", {
                    get: function () {
                        return this._customData;
                    },
                    set: function (customData) {
                        this._customData = customData;
                    },
                    enumerable: true,
                    configurable: true
                });
                return MediaInfo;
            }());
            media_1.MediaInfo = MediaInfo;
            var PauseRequest = /** @class */ (function () {
                function PauseRequest() {
                }
                return PauseRequest;
            }());
            media_1.PauseRequest = PauseRequest;
            var PlayRequest = /** @class */ (function () {
                function PlayRequest() {
                }
                return PlayRequest;
            }());
            media_1.PlayRequest = PlayRequest;
            var SeekRequest = /** @class */ (function () {
                function SeekRequest() {
                }
                return SeekRequest;
            }());
            media_1.SeekRequest = SeekRequest;
            var StopRequest = /** @class */ (function () {
                function StopRequest() {
                }
                return StopRequest;
            }());
            media_1.StopRequest = StopRequest;
            var TextTrackStyle = /** @class */ (function () {
                function TextTrackStyle() {
                }
                return TextTrackStyle;
            }());
            media_1.TextTrackStyle = TextTrackStyle;
            var Track = /** @class */ (function () {
                function Track() {
                }
                return Track;
            }());
            media_1.Track = Track;
            var VolumeRequest = /** @class */ (function () {
                function VolumeRequest(volume) {
                    this.volume = volume;
                }
                ;
                return VolumeRequest;
            }());
            media_1.VolumeRequest = VolumeRequest;
            var IdleReason = /** @class */ (function () {
                function IdleReason() {
                }
                IdleReason.CANCELLED = 'CANCELLED';
                IdleReason.INTERRUPTED = 'INTERRUPTED';
                IdleReason.FINISHED = 'FINISHED';
                IdleReason.ERROR = 'ERROR';
                return IdleReason;
            }());
            media_1.IdleReason = IdleReason;
            var MediaCommand = /** @class */ (function () {
                function MediaCommand() {
                }
                MediaCommand.PAUSE = 'PAUSE';
                MediaCommand.SEEK = 'SEEK';
                MediaCommand.STREAM_VOLUME = 'STREAM_VOLUME';
                MediaCommand.STREAM_MUTE = 'STREAM_MUTE';
                return MediaCommand;
            }());
            media_1.MediaCommand = MediaCommand;
            var PlayerState = /** @class */ (function () {
                function PlayerState() {
                }
                PlayerState.IDLE = 'IDLE';
                PlayerState.PLAYING = 'PLAYING';
                PlayerState.PAUSED = 'PAUSED';
                PlayerState.BUFFERING = 'BUFFERING';
                return PlayerState;
            }());
            media_1.PlayerState = PlayerState;
            var RepeatMode = /** @class */ (function () {
                function RepeatMode() {
                }
                RepeatMode.OFF = 'OFF';
                RepeatMode.ALL = 'ALL';
                RepeatMode.SINGLE = 'SINGLE';
                RepeatMode.ALL_AND_SHUFFLE = 'ALL_AND_SHUFFLE';
                return RepeatMode;
            }());
            media_1.RepeatMode = RepeatMode;
            var ResumeState = /** @class */ (function () {
                function ResumeState() {
                }
                ResumeState.PLAYBACK_START = 'PLAYBACK_START';
                ResumeState.PLAYBACK_PAUSE = 'PLAYBACK_PAUSE';
                return ResumeState;
            }());
            media_1.ResumeState = ResumeState;
            var StreamType = /** @class */ (function () {
                function StreamType() {
                }
                StreamType.BUFFERED = 'BUFFERED';
                StreamType.LIVE = 'LIVE';
                StreamType.NONE = 'NONE';
                return StreamType;
            }());
            media_1.StreamType = StreamType;
            var TrackType = /** @class */ (function () {
                function TrackType() {
                }
                TrackType.TEXT = 'TEXT';
                TrackType.AUDIO = 'AUDIO';
                TrackType.VIDEO = 'VIDEO';
                return TrackType;
            }());
            media_1.TrackType = TrackType;
            var TextTrackType = /** @class */ (function () {
                function TextTrackType() {
                }
                TextTrackType.SUBTITLES = 'SUBTITLES';
                TextTrackType.CAPTIONS = 'CAPTIONS';
                TextTrackType.DESCRIPTIONS = 'DESCRIPTIONS';
                TextTrackType.CHAPTERS = 'CHAPTERS';
                TextTrackType.METADATA = 'METADATA';
                return TextTrackType;
            }());
            media_1.TextTrackType = TextTrackType;
        })(media = cast.media || (cast.media = {}));
        var ResultCallbackHandler = /** @class */ (function () {
            function ResultCallbackHandler() {
                this.currentCallbackId = 0;
                this.registry = {};
            }
            ResultCallbackHandler.prototype.handle = function (id) {
                var params = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    params[_i - 1] = arguments[_i];
                }
                var callback = this.registry[id.toString()];
                if (callback && callback.handle) {
                    callback.handle.apply(callback, params);
                }
                if (callback) {
                    this.unRegister(id);
                }
            };
            ResultCallbackHandler.prototype.error = function (id, errorCode, description) {
                var callback = this.registry[id.toString()];
                if (callback && callback.error) {
                    callback.error(new Error(errorCode, description));
                }
                if (callback) {
                    this.unRegister(id);
                }
            };
            ResultCallbackHandler.prototype.register = function (callback, error) {
                var callbackId = this.currentCallbackId++;
                this.registry[callbackId.toString()] = {
                    handle: callback,
                    error: error
                };
                return callbackId;
            };
            ResultCallbackHandler.prototype.unRegister = function (id) {
                this.registry[id.toString()] = undefined;
            };
            return ResultCallbackHandler;
        }());
        cast.ResultCallbackHandler = ResultCallbackHandler;
        var ListenerCallbackHandler = /** @class */ (function () {
            function ListenerCallbackHandler() {
                this.currentCallbackId = 0;
                this.registry = {};
                this.listenerMap = {};
            }
            ListenerCallbackHandler.prototype.handle = function (id) {
                var params = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    params[_i - 1] = arguments[_i];
                }
                var listener = this.registry[id.toString()];
                if (listener) {
                    listener.apply(void 0, params);
                }
            };
            ListenerCallbackHandler.prototype.register = function (listener) {
                var callbackId = this.currentCallbackId++;
                this.registry[callbackId.toString()] = listener;
                this.listenerMap[listener] = callbackId;
                return callbackId;
            };
            ListenerCallbackHandler.prototype.lookup = function (listener) {
                return this.listenerMap[listener];
            };
            ListenerCallbackHandler.prototype.unRegister = function (listener) {
                if (this.listenerMap[listener]) {
                    this.registry[this.lookup(listener).toString()] = undefined;
                    this.listenerMap[listener] = undefined;
                }
            };
            return ListenerCallbackHandler;
        }());
        cast.ListenerCallbackHandler = ListenerCallbackHandler;
    })(cast = chrome.cast || (chrome.cast = {}));
})(chrome || (chrome = {}));
var chromecastCallbackHandler = new chrome.cast.ResultCallbackHandler();
var chromecastListenerCallbackHandler = new chrome.cast.ListenerCallbackHandler();
var native = new chrome.cast.Native();
