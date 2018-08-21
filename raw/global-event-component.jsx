'use strict';

const React = require('react');

class GlobalEventComponent extends React.Component {
    constructor() {
        super();

        this._keyBindings = this._keyBindings.bind(this);
        this._eventTypes = [
            "cached","error","abort","load","beforeunload",
            "unload","online","offline","focus","blur","open","message","close",
            "pagehide","pageshow","popstate","animationstart","animationend",
            "animationiteration","transitionstart","transitioncancel",
            "transitionend","transitionrun","reset","submit","beforeprint",
            "afterprint","compositionstart","compositionupdate","compositionend",
            "fullscreenchange","fullscreenerror","resize","scroll","cut","copy",
            "paste","keydown","keypress","keyup","mouseenter","mouseover",
            "mousemove","mousedown","mouseup","auxclick","click","dblclick",
            "contextmenu","wheel","mouseleave","mouseout","select",
            "pointerlockchange","pointerlockerror","dragstart","drag","dragend",
            "dragenter","dragover","dragleave","drop","durationchange","duration",
            "loadedmetadata","loadeddata","canplay","canplaythrough","ended",
            "emptied","stalled","suspend","play","playing","pause","waiting",
            "seeking","seeked","ratechange","timeupdate","currentTime",
            "volumechange","complete","audioprocess","loadstart","progress",
            "timeout","loadend","appinstalled","audioend","audiostart",
            "beginEvent","blocked","versionchange","boundary","change",
            "chargingchange","chargingtimechange","chargingTime","checking",
            "devicechange","devicelight","devicemotion","deviceorientation",
            "deviceproximity","dischargingtimechange","dischargingTime",
            "DOMActivate","DOMAttributeNameChanged","DOMAttrModified",
            "DOMCharacterDataModified","DOMContentLoaded","DOMElementNameChanged",
            "DOMFocusIn","focusin","DOMFocusOut","focusout","DOMNodeInserted",
            "DOMNodeInsertedIntoDocument","DOMNodeRemoved",
            "DOMNodeRemovedFromDocument","DOMSubtreeModified","downloading","end",
            "endEvent","gamepadconnected","gamepaddisconnected","gotpointercapture",
            "hashchange","lostpointercapture","input","invalid","languagechange",
            "levelchange","level","mark","messageerror","nomatch",
            "notificationclick","noupdate","obsolete","orientationchange",
            "pointercancel","pointerdown","pointerenter","pointerleave",
            "pointermove","pointerout","pointerover","pointerup","push",
            "pushsubscriptionchange","readystatechange","repeatEvent",
            "resourcetimingbufferfull","result","resume","selectstart",
            "selectionchange","show","slotchange","soundend","soundstart",
            "speechend","speechstart","start","SpeechRecognition","storage",
            "success","SVGAbort","SVGError","SVGLoad","SVGResize","SVGScroll",
            "SVGUnload","SVGZoom","touchcancel","touchend","touchmove","touchstart",
            "updateready","swapCache()","upgradeneeded","userproximity","near",
            "voiceschanged","visibilitychange","afterscriptexecute",
            "beforescriptexecute","beforeinstallprompt","cardstatechange",
            "connectionInfoUpdate","cfstatechange","datachange","dataerror",
            "DOMMouseScroll","dragdrop","DragEvent","dragexit","draggesture",
            "icccardlockerror","iccinfochange","localized","mousewheel",
            "MozAudioAvailable","mozbrowseractivitydone","mozbrowserasyncscroll",
            "mozbrowseraudioplaybackchange","mozbrowsercaretstatechanged",
            "mozbrowserclose","mozbrowsercontextmenu",
            "mozbrowserdocumentfirstpaint","mozbrowsererror","mozbrowserfindchange",
            "mozbrowserfirstpaint","mozbrowsericonchange",
            "mozbrowserlocationchange","mozbrowserloadend","mozbrowserloadstart",
            "mozbrowsermanifestchange","mozbrowsermetachange",
            "mozbrowseropensearch","mozbrowseropentab","mozbrowseropenwindow",
            "mozbrowserresize","mozbrowserscroll","mozbrowserscrollareachanged",
            "mozbrowserscrollviewchange","mozbrowsersecuritychange",
            "mozbrowserselectionstatechanged","mozbrowsershowmodalprompt",
            "mozbrowsertitlechange","mozbrowserusernameandpasswordrequired",
            "mozbrowservisibilitychange","MozGamepadButtonDown",
            "MozGamepadButtonUp","MozMousePixelScroll","MozOrientation",
            "MozScrolledAreaChanged","moztimechange","alerting","busy",
            "callschanged","connected","connecting","delivered","dialing",
            "disabled","disconnected","disconnecting","enabled","held","holding",
            "incoming","received","resuming","sent","statechange","statuschange",
            "overflow","visible","smartcard-insert","smartcard-remove","stkcommand",
            "stksessionend","text","touchenter","touchleave","underflow",
            "uploadprogress","voicechange","broadcast","observer",
            "CheckboxStateChange","checkbox","command","commandupdate",
            "commandset","DOMMenuItemActive","DOMMenuItemInactive","popuphidden",
            "PopupEvent","popuphiding","popupshowing","popupshown",
            "RadioStateChange","radio","ValueChange","meta","notification"
        ];
        this._classKeys = [];
    }

    _getAllPropertyNames() {
        let obj = this;
        let props = [];

        do {
            Object.getOwnPropertyNames(obj).forEach(prop => {
                if (props.indexOf(prop) === -1) {
                    props.push(prop);
                }
            });
        } while (
            (obj = Object.getPrototypeOf(obj))
            && obj.constructor !== GlobalEventComponent
        );

        return props;
    }

    _keyBindings(event) {
        const {_classKeys} = this;

        for (let key of _classKeys) {
            if (key.toLowerCase() === `onglobal${event.type.toLowerCase()}`) {
                this[key](event);
            }
        }
    }

    componentDidMount() {
        const {_eventTypes, _keyBindings} = this;

        this._classKeys = this._getAllPropertyNames();

        for (let type of _eventTypes) {
            window.addEventListener(type, _keyBindings, false);
        }
    }

    componentWillUnmount() {
        const {_eventTypes, _keyBindings} = this;

        for (let type of _eventTypes) {
            window.removeEventListener(type, _keyBindings, false);
        }
    }
}

module.exports = GlobalEventComponent;
