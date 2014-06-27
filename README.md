Route 65
=======

Simple peer-to-peer WebRTC chat application made with PeerJS.

**German localization only at the moment (as this is a project for a German organization)!**

###Usage:

* Download the latest (v0.10.0-rc1) node-webkit executables from https://github.com/rogerwang/node-webkit
* Download `route65.nw` and run it with node-webkit (see https://github.com/rogerwang/node-webkit/wiki/How-to-run-apps)
  * Select `Bob` and start a second instance of the application as `Alice`.
  * Now you should be able to chat from window to window.

####A note on security:
This is just a very early preview of the beta version! Don't use it to transfer 'real world data' like passwords or other personal details. The application is using a public available API key for the PeerServer cloud and the IDs for communication are hard-coded into `app.js`. That means anyone can view the ID and try to peer with it. **Don't trust the peer, if you're not exactly knowing what you do!**

###Improvements:
Route 65 is very beta and there might be a lot of bugs and missing features. If you're experiencing any issues, [please report them](https://github.com/ConcurrentHashMap/route65/issues).

###License:
[Licensed under MIT](https://github.com/ConcurrentHashMap/route65/blob/master/LICENSE)