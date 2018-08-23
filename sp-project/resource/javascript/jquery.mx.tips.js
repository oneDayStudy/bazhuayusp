/*
 * jQuery MX.Tips v2.5.0
 * Copyright 2015-2016 OCTOPUS
 * Contributing Author: JinYajun
 */
; var MX_TIPS = {
    Self: null,
    Tips: function (msg, delay, flow) {
        if (this.Self != null) { this.Self.close(); this.Self.unLock(); }
        this.Self = $.dialog({
            title: "alert",
            content: msg,
            time: typeof (delay) == "undefined" ? 3000 : delay,
            closeCallback: function () { flow ? flow.focus() : ""; }
        });
    },
	Alert: function (msg, flow, callback) {
        if (this.Self != null) { this.Self.close(); }
        this.Self = $.dialog({
            title: 'none',
            content: msg,
            ok: function () {
                
            },
            closeCallback: function () { flow ? flow.focus() : ""; if (typeof (callback) == "function") { callback(); } }
        });
    },
    Confirm: function (msg, callback) {
        if (this.Self != null) { this.Self.close(); }
        this.Self = $.dialog({
            title: 'alert',
            content: msg,
            ok: function () {
                if (typeof (callback) == "function") { callback(); }
            },
            cancel: function () { }
        });
    },
    Loading: function () {
        if (this.Self != null) { this.Self.close(); }
        this.Self = $.dialog({
            title: 'load',
            lock: false
        });
    },
    Close: function () {
        this.Self.close();
    }
};