cc.Class({
    extends: cc.Component,

    properties: {
        webView: {default: null, displayName: "页面", type: cc.WebView,},

    },


    onLoad() {
        let href = `${window.location.origin}/pay.html`;
        console.log(`webview.src = ${href}`);
        this.webView.url = href;
    },

    start() {

    },
    onClick() {


    },

    // update (dt) {},
});
