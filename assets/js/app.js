import "../css/app.scss";
import "phoenix_html";
import _ from "lodash";

// Webpack + Janus client

import { Janus } from "janus-gateway";

const SERVER = "http://localhost:8088/janus";

var echotest = null;

function component() {
    return document.createElement("div");
}

window.start_call = function() {
    const local_video = document.getElementById("local_video");
    const remote_video = document.getElementById("remote_video");
    const remote_video_1 = document.getElementById("remote_video_1");

    console.log(local_video.id)
    console.log(remote_video.id)

    Janus.init({
        debug: true,
        dependencies: Janus.useDefaultDependencies(),
        callback: () => console.log("85 é lixo .l."),
    });

    var janus = new Janus({
        server: SERVER,
        success: () => {
            // Done! attach to plugin XYZ
            console.log("success");
            console.log(janus.isConnected());

            janus.attach({
                plugin: "janus.plugin.echotest",
                opaqueId: "dinis",
                success: (handle) => {
                    // Plugin attached! 'pluginHandle' is our handle
                    console.log("plugin handle success");

                    echotest = handle;

                    var body = { audio: true, video: true };
                    echotest.send({ message: body });

                    echotest.createOffer({
                        media: { data: true }, // Let's negotiate data channels as well
                        success: (jsep) => {
                            Janus.debug("Got SDP!");
                            Janus.debug(jsep);
                            echotest.send({ message: body, jsep: jsep });
                        },
                        error: (error) => {
                            Janus.error("WebRTC error:", error);
                            bootbox.alert(
                                "WebRTC error... " + JSON.stringify(error)
                            );
                        },
                    });
                },
                error: (cause) => {
                    // Couldn't attach to the plugin
                },
                consentDialog: (on) => {
                    // e.g., Darken the screen if on=true (getUserMedia incoming), restore it otherwise
                },
                ondata: (data) => {
                    console.log(`Message: ${data}`);
                    Janus.debug(`We got data from the DataChannel! ${data}`);
                },
                ondataopen: () => {
                    console.log("Data channel open");
                },
                onmessage: (msg, jsep) => {
                    console.log(msg);

                    sendTextMessage(echotest, "shit");

                    // Handle msg, if needed, and check jsep
                    if (jsep !== undefined && jsep !== null) {
                        // We have the ANSWER from the plugin
                        echotest.handleRemoteJsep({ jsep: jsep });
                    }
                },
                onlocalstream: (stream) => {
                    Janus.attachMediaStream(local_video, stream);
                    // Invoked after createOffer
                    // This is our video
                },
                onremotestream: (stream) => {
                    Janus.attachMediaStream(remote_video, stream);
                    Janus.attachMediaStream(remote_video_1, stream);
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

    document.getElementById('start_call').remove()
}

const sendTextMessage = (echotest, message) => {
    echotest.data({
        text: message,
        error: (reason) => {
            console.log("message not sent");
            console.log(reason);
        },
        success: () => {
            console.log(`sent message ${message}`);
        },
    });
};

document.body.appendChild(component());
