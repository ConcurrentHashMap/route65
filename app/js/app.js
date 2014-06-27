/**
 * Angular application module and directives for Route 65
 *
 * @author ConcurrentHashMap <ConcurrentHashMap@arcor.de>
 * @license Licensed under MIT (https://github.com/ConcurrentHashMap/route65/blob/master/LICENSE)
 */
 angular.module('app', []).controller('appCtrl', ['$scope', function($scope) {
    $scope.user = {name: 'Nicht verbunden'};
    $scope.messages = [];
    $scope.connection = '';

    // Pre-configured list of peers
    var peerList = {
    1: {
        userId: '87975ef6cd06',
        peerWithId: '3f2a8d515c4b',
        name: 'Bob'
    },
    2: {
        userId: '3f2a8d515c4b',
        peerWithId: '87975ef6cd06',
        name: 'Alice'
    }};

    // TODO: Use localStorage instead to persist data on client (but leave sessionStorage for demo)
    var storage = sessionStorage;
    if(storage.getItem('peerUser') == undefined) {
        // We need to prompt for an user to select
        bootbox.dialog({
            title: "Erster Start &ndash; Setup",
            message: "Bitte Benutzernamen auswählen.<br><b>Achtung! Diese Entscheidung kann nicht rückgängig gemacht werden!</b>",
            closeButton: false,
            buttons: {
                success: {
                    label: peerList[1].name,
                    className: "btn-default",
                    callback: function() {
                        $scope.$apply(function() {
                            $scope.user = peerList[1];
                            storage.setItem('peerUser', JSON.stringify($scope.user));
                        });
                        location.reload();
                    }
                },
                main: {
                    label: peerList[2].name,
                    className: "btn-default",
                    callback: function() {
                        $scope.$apply(function() {
                            $scope.user = peerList[2];
                            storage.setItem('peerUser', JSON.stringify($scope.user));
                        });
                        location.reload();
                    }
                }
            }
        });       
    } else {
        // Get user from sessionStorage / localStorage
        $scope.user = JSON.parse(storage.getItem('peerUser'));
    }

    var msg = {from: {peerId: '', name: 'System'}, to: $scope.user.userId, timestamp: Date.now(), message: 'Login...'};
    // Output to console and message area
    console.log(msg);
    $scope.messages.push(msg);

    // Register peer at the peer server
    // TODO: Change API key / setup own server (for all the hackers: this is the public key from PeerJS, published on http://peerjs.com/docs/#start)
    $scope.peer = new Peer($scope.user.userId, {key: 'lwjd5qra8257b9'});  

    // Open connection to peer server and display login information
    $scope.peer.on('open', function(id) {
        $scope.$apply(function() {
            var msg = {from: {peerId: '', name: 'System'}, to: id, timestamp: Date.now(), message: 'Eingeloggt als ' + $scope.user.name};
            // Output to console and message area
            console.log(msg);
            $scope.messages.push(msg);
        });
    });

    $scope.peer.on('error', function(err) {
        var msg = {from: {peerId: '', name: 'System'}, to: $scope.user.userId, timestamp: Date.now(), message: 'Verbindungsfehler: "' + err + '"'};
        console.log(msg);
        $scope.$apply(function() {
            $scope.messages.push(msg);
        });
    });

    // Handle event: Incoming connection
    $scope.peer.on('connection', function(connection) {
        var msg = {from: {peerId: '', name: 'System'}, to: $scope.user.userId, timestamp: Date.now(), message: 'Eingehende Verbindung von ' + connection.metadata};
        console.log(msg);
        $scope.$apply(function() {
            $scope.connection = connection;
            $scope.messages.push(msg);
        });

        $scope.connection.on('open', function() {
            var msg = {from: {peerId: '', name: 'System'}, to: $scope.user.userId, timestamp: Date.now(), message: 'Verbindung erfolgreich hergestellt'};

            // Don't allow bad connections from a peer outside the peerList
            if($scope.connection.peer !== $scope.user.peerWithId) {
                msg = {from: {peerId: '', name: 'System'}, to: $scope.user.userId, timestamp: Date.now(), message: 'Verbindung abgelehnt.'};
                console.log(msg);
                $scope.messages.push(msg);
                $scope.connection.close();
                $scope.$apply();
                return;
            }

            console.log(msg);
            $scope.messages.push(msg);

            // simply call apply() to notify view about the successful opening of connection
            $scope.$apply();
        });

        // Output received messages
        $scope.connection.on('data', function(data) {
            $scope.$apply(function() {
                $scope.messages.push(data);
            });
            console.log(data);
            $scope.playBeep();
        });

        $scope.connection.on('error', function(err) {
            var msg = {from: {peerId: '', name: 'System'}, to: $scope.user.userId, timestamp: Date.now(), message: 'Verbindungsfehler: "' + err + '"'};
            console.log(msg);
            $scope.$apply(function() {
                $scope.messages.push(msg);
            });
        });
        $scope.connection.on('close', function() { 
            var msg = {from: {peerId: '', name: 'System'}, to: $scope.user.userId, timestamp: Date.now(), message: 'Verbindung wurde unterbrochen'};
            console.log(msg);
            $scope.$apply(function() {
                $scope.messages.push(msg);
                $scope.connection = '';
            });
        });
    });

    // Function for connecting to peer
    $scope.connect = function() {
        // Check if its a client command first
        // We can't use the if(true) { return; } syntax here, as it won't connect if the message is empty then
        $scope.checkClientCommands();

        var msg = {from: {peerId: '', name: 'System'}, to: $scope.user.userId, timestamp: Date.now(), message: 'Verbindungsaufbau...'};
        console.log(msg);
        $scope.messages.push(msg);

        // Create connection
        $scope.connection = $scope.peer.connect($scope.user.peerWithId, {metadata: $scope.user.name, reliable: true});

        // Connection successful event
        $scope.connection.on('open', function() {
            var msg = {from: {peerId: '', name: 'System'}, to: $scope.user.userId, timestamp: Date.now(), message: 'Verbindung erfolgreich hergestellt'};
            console.log(msg);
            $scope.messages.push(msg);

            // simply call apply() to notify view about the successful opening of connection
            $scope.$apply();

            // Receive messages event
            $scope.connection.on('data', function(data) {
                $scope.$apply(function() {
                    $scope.messages.push(data);
                });
                console.log(data);
                $scope.playBeep();
            });
        });

        $scope.connection.on('error', function(err) {
            var msg = {from: {peerId: '', name: 'System'}, to: $scope.user.userId, timestamp: Date.now(), message: 'Verbindungsfehler: "' + err + '"'};
            console.log(msg);
            $scope.$apply(function() {
                $scope.messages.push(msg);
            });
        });
        $scope.connection.on('close', function() { 
            var msg = {from: {peerId: '', name: 'System'}, to: $scope.user.userId, timestamp: Date.now(), message: 'Verbindung wurde unterbrochen'};
            console.log(msg);
            $scope.$apply(function() {
                $scope.messages.push(msg);
                $scope.connection = '';
            });
        });
    };

    // Function for sending messages to connected peer
    $scope.sendMessage = function() {
        // Check if its a client command first
        if($scope.checkClientCommands()) { return }

        // Create message object
        try {
            var msg = {from: {peerId: $scope.user.userId, name: $scope.user.name}, to: $scope.connection.peer, timestamp: Date.now(), message: $scope.message};
            $scope.connection.send(msg);
        } 
        catch(err) {
            // No connection yet, try to connect
            $scope.connect();
            return;
        }

        // Output to console and message area
        $scope.messages.push(msg);
        console.log(msg);

        // Clear the input field for the next message
        $scope.message = '';
    };

    $scope.checkClientCommands = function() {
        // Return if empty
        if($scope.message == null || $scope.message === '') { return true; }

        // Detect client command
        if($scope.message.substr(0, 1) === '/') {
            // As there are some commands that may fail if not running in node-webkit, surround with try-catch
            try {
                if($scope.message === '/console') {
                    // Open Developer Tools
                    require('nw.gui').Window.get().showDevTools();  
                }
                else if($scope.message === '/clear') {
                    // Clear output
                    $scope.messages = [];
                }
                else if($scope.message === '/reload') {
                    // Reload the browser
                    $scope.peer.destroy();
                    location.reload();
                }
                else if($scope.message === '/emoji') {
                    // Open Emoji cheat sheet
                    require('nw.gui').Window.get(window.open('http://www.emoji-cheat-sheet.com'));
                }
                else {
                    var msg = {from: {peerId: '', name: 'System'}, to: $scope.user.userId, timestamp: Date.now(), message: 'Befehl ' + $scope.message + ' existiert nicht!'};
                    console.log(msg);
                    $scope.messages.push(msg);
                }
            }
            // For all commands: Clear up the input field and return to prevent sending command to peer
            finally {
                $scope.message = '';
                return true;
            }
        }
    };

    $scope.playBeep = function() {
        beeplay({bpm: 140}).play('F#5', 1/4);
    };

}]).directive('autoScroll', function() {
    // Credits: https://github.com/james-huston/angular-directive-autoscroll
    return {
        link: function(scope, element) {
            scope.$watch(function() {
                return element.children().length;
            },
            function() {
                element.animate({scrollTop: element.prop('scrollHeight')}, 300);
            });
        }
    };
}).directive("renderEmoji", function() {
    return {
        link: function(scope, element) {
            scope.$watch(function() {
                return element.children().length;
            },
            function() {
                scope.$evalAsync(function() {
                    // evalAsync used to wait for the DOM to be parsed but before the browser will render it
                    emojify.run();
                });
            });
        }
    };
});