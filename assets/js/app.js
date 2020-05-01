// We need to import the CSS so that webpack will load it.
// The MiniCssExtractPlugin is used to separate it out into
// its own CSS file.
import "../css/app.scss"

// webpack automatically bundles all modules in your
// entry points. Those entry points can be configured
// in "webpack.config.js".
//
// Import deps with the dep name or local files with a relative path, for example:
//
//     import {Socket} from "phoenix"
//     import socket from "./socket"
//
import "phoenix_html"

// Webpack + Janus client
import _ from 'lodash';
import { Janus } from 'janus-gateway';

function component() {
    const element = document.createElement('div');
  
    element.innerHTML = _.join(['Hello', '85'], ' ');

    Janus.init({
        debug: true,
        dependencies: Janus.useDefaultDependencies(), // or: Janus.useOldDependencies() to get the behaviour of previous Janus versions
        callback: function() {
            console.log("85 deus")
        }
    });
  
    return element;
  }
  
  document.body.appendChild(component());