import "../css/app.scss";
import "phoenix_html";
import _ from "lodash";

// Webpack + Janus client

import { Janus } from "janus-gateway";

const DEFAULT_ROOM = 1234;
const USERNAME = "dinis";
const SERVER = "https://192.168.1.226:8089/janus";

var my_id;
var my_private_id;

var janus = null;
var videoroom_handle = null;

var remote_streams = [];

function component() {
    const element = document.createElement("div");

    return element;
}

window.start_call = function () {
    const local_video = document.getElementById("local_video");

    console.log(local_video.id);

    Janus.init({
        debug: true,
        dependencies: Janus.useDefaultDependencies(),
        callback: () => console.log("85 deus"),
    });

    janus = new Janus({
        server: SERVER,
        success: () => {
            console.log("success");
            console.log(janus.isConnected());

            janus.attach({
                plugin: "janus.plugin.videoroom",
                opaqueId: "dinis",
                success: (handle) => {
                    console.log("master plugin handle success");

                    videoroom_handle = handle;

                    // Joining room
                    joinRoom(videoroom_handle);
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

                    const room = msg["room"];
                    const event_type = msg["videoroom"];
                    const publishers = msg["publishers"];

                    if (event_type === "joined") {
                        console.log(`Joined room ${room}...`);

                        my_id = msg["id"];
                        my_private_id = msg["private_id"];

                        joinAndConfigure(videoroom_handle);
                    }

                    if (event_type === "joined" || event_type === "event") {
                        if (publishers !== undefined && publishers !== null) {
                            console.log("Publishers!!");

                            for (var publisher in publishers) {
                                console.log(`${JSON.stringify(publisher)}`);
                                addNewPublisher(publishers[publisher]["id"]);
                            }
                        }
                    }

                    // Handle msg, if needed, and check jsep
                    if (jsep !== undefined && jsep !== null) {
                        // We have the ANSWER from the plugin
                        videoroom_handle.handleRemoteJsep({ jsep: jsep });
                    }
                },
                onlocalstream: (stream) => {
                    Janus.attachMediaStream(local_video, stream);
                    // Invoked after createOffer
                    // This is our video
                },
                onremotestream: (stream) => {
                    // Janus.attachMediaStream(remote_video_1, stream);
                    // Janus.attachMediaStream(remote_video_2, stream);
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
            console.log(cause);
            console.log("error");
        },
        destroyed: () => {
            // I should get rid of this
            console.log("destroyed");
        },
    });
}

const sendTextMessage = (videoroom_handle, message) => {
    videoroom_handle.data({
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

const joinRoom = (handle) => {
    console.log("Joining room");

    var join_request = {
        request: "join",
        room: DEFAULT_ROOM,
        ptype: "publisher",
        display: USERNAME,
    };

    handle.send({ message: join_request });
};

const createRoom = (id, description) => {
    // Create room
    console.log("Creating room");

    var create_room_request = {
        request: "create",
        room: id,
        permanent: true,
        description: description,
    };

    result = videoroom_handle.send({ message: create_room_request });
};

const joinAndConfigure = (handle) => {
    console.log("Creating offer...");
    handle.createOffer({
        media: {
            audioRecv: false,
            videoRecv: false,
            audioSend: true,
            videoSend: true,
            data: true,
        },
        success: (jsep) => {
            console.log("Create offer with success");
            var publish = {
                request: "configure", // THIS SHOULD BE REPLACED BY joinandconfigure
                audio: true,
                video: true,
            };

            handle.send({ message: publish, jsep: jsep });
        },
        error: (error) => {
            console.log("Error when creating offer");
        },
    });
};

const subscribe = (handle, id) => {
    console.log("Subscribing...");
    var subscribe = {
        request: "join",
        room: DEFAULT_ROOM,
        ptype: "subscriber",
        feed: id,
        private_id: my_private_id,
    };

    handle.send({ message: subscribe });
};

const addNewPublisher = (id) => {
    console.log("Adding a new publisher...");
    console.log(`${JSON.stringify(id)}`);

    var remoteFeed = null;

    janus.attach({
        plugin: "janus.plugin.videoroom",
        success: (handle) => {
            console.log("slave plugin handle success");

            remoteFeed = handle;
            subscribe(remoteFeed, id);
        },
        error: (error) => {
            console.log("Error attaching slave plugin");
        },
        onmessage: (msg, jsep) => {
            // To-do
            console.log("debug log message!");

            if (jsep !== undefined && jsep !== null) {
                remoteFeed.createAnswer({
                    jsep: jsep,
                    media: { audioSend: false, videoSend: false, data: true },
                    success: (jsep) => {
                        console.log("Created answer with success");

                        var body = { request: "start", room: DEFAULT_ROOM };
                        remoteFeed.send({ message: body, jsep: jsep });
                    },
                    error: (error) => {
                        console.log("Error when answering offer");
                    },
                });
            }
        },
        onremotestream: (stream) => {
            console.log("on remote stream...");
            video_component = addVideoToPage()
            Janus.attachMediaStream(video_component, stream);
        },
    });
};

const addVideoToPage = () => {
    video = document.createElement('video')
    video.id = "remote_video_" + Math.floor(Math.random() * 1000).toString()
    video.width=315
    video.height=215
    video.autoplay=true
    video.playsinline=true
    document.getElementById("video_section").appendChild(video)

    return video
}

document.body.appendChild(component());
