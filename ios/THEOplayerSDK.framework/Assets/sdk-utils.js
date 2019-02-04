var THEOplayerUtils = (function () {
    function timeRangesToArray(timeRanges) {
        var result = [];
        for (var i = 0; i < timeRanges.length; i++) {
            result[i] = {
                start: timeRanges.start(i),
                end: timeRanges.end(i)
            };
        }
        return result;
    }
    // based on https://github.com/isaacs/json-stringify-safe/blob/02cfafd45f06d076ac4bf0dd28be6738a07a72f9/stringify.js#L4
    // which is used in NodeJS and detects and replaces circular references
    function stringify(obj) {
        return JSON.stringify(obj, serializer(timeRangesReplacer));
    }
    function timeRangesReplacer(key, value) {
        if (typeof value != "undefined" && value != null &&
            typeof value.start == "function" &&
            typeof value.end == "function" &&
            typeof value.length == "number") {
            return timeRangesToArray(value);
        }
        else {
            return value;
        }
    }
    function serializer(replacer, cycleReplacer) {
        var stack = [], keys = [];
        if (cycleReplacer == null)
            cycleReplacer = function (key, value) {
                if (stack[0] === value)
                    return "[Circular ~]";
                return "[Circular ~." + keys.slice(0, stack.indexOf(value)).join(".") + "]";
            };
        return function (key, value) {
            if (stack.length > 0) {
                var thisPos = stack.indexOf(this);
                ~thisPos ? stack.splice(thisPos + 1) : stack.push(this); //if 'this' is not in stack, then clear stack, otherwise, add 'this' to stack
                ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key);
                if (~stack.indexOf(value))
                    value = cycleReplacer.call(this, key, value);
            }
            else
                stack.push(value);
            return replacer == null ? value : replacer.call(this, key, value);
        };
    }
    function minimize(event) {
        var output = {};
        // Swift needs a date object, but many events from Chromecast have a string associated to event.date instead.
        if (typeof event.date === 'string') {
            output.date = new Date(event.date);
        }
        else {
            output.date = event.date;
        }
        output.type = event.type;
        switch (event.type) {
            case "play":
            case "playing":
            case "pause":
            case "seeking":
            case "seeked":
            case "timeupdate":
            case "ended":
            case "waiting":
            case "emptied":
                output.currentTime = event.currentTime;
                break;
            case "progress":
                output.currentTime = event.currentTime;
                output.mediatype = event.mediatype;
                output.representationId = event.representationId;
                output.buffered = timeRangesToArray(event.buffered);
                break;
            case "ratechange":
                output.currentTime = event.currentTime;
                output.playbackRate = event.playbackRate;
                break;
            case "durationchange":
                output.duration = event.duration;
                break;
            case "sourcechange":
                output.source = event.source;
                break;
            case "readystatechange":
            case "loadedmetadata":
            case "loadeddata":
            case "loadstart":
            case "canplay":
            case "canplaythrough":
                output.currentTime = event.currentTime;
                output.readyState = event.readyState;
                break;
            case "error":
                output.error = event.error;
                break;
            case "addcue":
            case "removecue":
            case "enter":
            case "exit":
            case "entercue":
            case "exitcue":
                if (event.cue.track) {
                    output.cue = serializeCue(event.cue, event.cue.track.type);
                    output.cue.track = { 'uid': event.cue.track.uid };
                }
                else {
                    output.cue = serializeCue(event.cue, '');
                }
                break;
            case "cuechange":
                var activeCues = [];
                for (var i = 0; i < event.track.activeCues.length; i++) {
                    var cue = event.track.activeCues[i];
                    activeCues.push(serializeCue(cue, event.track.type));
                }
                output.track = {
                    'activeCues': activeCues,
                    'uid': event.track.uid
                };
                break;
            case "addtrack":
            case "removetrack":
            case "change":
                output.track = serializeTrack(event.track);
                break;
            case "adbegin":
            case "adend":
            case "adbreakbegin":
            case "adbreakend":
                output.ad = event.ad;
                break;
            case "aderror":
                if (event._errorMessage) {
                    output._errorMessage = event._errorMessage;
                }
                if (event.message) {
                    output.message = event.message;
                }
                output.ad = event.ad;
                break;
            case "statechange":
                output.state = event.state;
                break;
            case "presentationmodechange":
            case "resize":
            default:
                break;
        }
        return output;
    }
    function serializeCue(cue, cueType) {
        var output = {};
        output.content = cue.content;
        output.endTime = cue.endTime;
        output.startTime = cue.startTime;
        output.id = cue.id;
        switch (cueType) {
            case "webvtt":
                output.align = cue.align;
                output.line = cue.line;
                output.lineAlign = cue.lineAlign;
                output.position = cue.position;
                output.positionAlign = cue.positionAlign;
                output.region = cue.region;
                output.size = cue.size;
                output.snapToLines = cue.snapToLines;
                output.text = cue.text;
                output.vertical = cue.vertical;
                break;
            case "ttml":
                // The only TTML in iOS/tvOS is SMPTE-TT, the content is an HTMLelement (or a IKDOMElement in tvOS)
                // Instead of passing this element to native,
                // we are going to parse the image data and pass it to Native as the cue content.
                output.content = parseImageDataFromSMPTETTContent(cue.content);
            case "id3":
            default:
                break;
        }
        return output;
    }
    function parseImageDataFromSMPTETTContent(content) {
        var imageNode = findImageElement(content);
        return imageNode.innerHTML;
    }
    function findImageElement(element) {
        var children = element.children;
        if (children.length === 0) {
            return undefined;
        }
        for (var i = 0; i < children.length; i++) {
            var child = children.item(i);
            if ((child.nodeName === "image") || (child.nodeName === "smpte:image")) {
                return child;
            }
            else {
                return findImageElement(child);
            }
        }
    }
    function serializeTrack(track) {
        var output = {};
        output.kind = track.kind;
        output.language = track.language;
        output.label = track.label;
        output.id = track.id;
        output.uid = track.uid;
        output.src = track.src;
        if ("cues" in track) {
            output.inBandMetadataTrackDispatchType = track.inBandMetadataTrackDispatchType;
            output.mode = track.mode;
            output.type = track.type;
            var cues = [];
            if (track.cues) {
                for (var i = 0; i < track.cues.length; i++) {
                    var cue = track.cues[i];
                    cues.push(serializeCue(cue, track.type));
                }
            }
            output.cues = cues;
            var activeCues = [];
            if (track.activeCues) {
                for (var i = 0; i < track.activeCues.length; i++) {
                    var cue = track.activeCues[i];
                    activeCues.push(serializeCue(cue, track.type));
                }
            }
            output.activeCues = activeCues;
        }
        else if ("enabled" in track) {
            output.enabled = track.enabled;
        }
        return output;
    }
    return {
        stringify: stringify,
        minimize: minimize
    };
})();
