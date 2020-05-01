// We need to import the CSS so that webpack will load it.
// The MiniCssExtractPlugin is used to separate it out into
// its own CSS file.
import "../css/app.scss";

// webpack automatically bundles all modules in your
// entry points. Those entry points can be configured
// in "webpack.config.js".
//
// Import deps with the dep name or local files with a relative path, for example:
//
//     import {Socket} from "phoenix"
//     import socket from "./socket"
//
import "phoenix_html";

// Webpack + Janus client
import _ from "lodash";
import { Janus } from "janus-gateway";

const SERVER = "http://localhost:8088/janus";

function component() {
    const element = document.createElement("div");

    element.innerHTML = _.join(["Hello", "85"], " ");

    Janus.init({
        debug: true,
        dependencies: Janus.useDefaultDependencies(), // or: Janus.useOldDependencies() to get the behaviour of previous Janus versions
        callback: () => console.log("85 deus"),
    });

    var janus = new Janus({
        server: SERVER,
        success: () => {
            // Done! attach to plugin XYZ
            console.log("success");
            console.log(janus.isConnected());

            janus.attach({
                plugin: "janus.plugin.echotest",
                success: (pluginHandle) => {
                    // Plugin attached! 'pluginHandle' is our handle
                    console.log("plugin handle success")
                },
                error: (cause) => {
                    // Couldn't attach to the plugin
                },
                consentDialog: (on) => {
                    // e.g., Darken the screen if on=true (getUserMedia incoming), restore it otherwise
                },
                onmessage: (msg, jsep) => {
                    // We got a message/event (msg) from the plugin
                    // If jsep is not null, this involves a WebRTC negotiation
                },
                onlocalstream: (stream) => {
                    // We have a local stream (getUserMedia worked!) to display
                },
                onremotestream: (stream) => {
                    // We have a remote stream (working PeerConnection!) to display
                },
                oncleanup: () => {
                    // PeerConnection with the plugin closed, clean the UI
                    // The plugin handle is still valid so we can create a new one
                },
                detached: () => {
                    // Connection with the plugin closed, get rid of its features
                    // The plugin handle is not valid anymore
                },
            });
        },
        error: (cause) => {
            // Error, can't go on...
            console.log("error");
        },
        destroyed: () => {
            // I should get rid of this
            console.log("destroyed");
        },
    });

    return element;
}

document.body.appendChild(component());
