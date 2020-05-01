import _ from 'lodash';
import { Janus } from 'janus-gateway';

function component() {
    const element = document.createElement('div');
  
    element.innerHTML = _.join(['Hello', 'webpack'], ' ');

    Janus.init({
        debug: true,
        dependencies: Janus.useDefaultDependencies(), // or: Janus.useOldDependencies() to get the behaviour of previous Janus versions
        callback: function() {
            console.log("piças")
        }
    });
  
    return element;
  }
  
  document.body.appendChild(component());