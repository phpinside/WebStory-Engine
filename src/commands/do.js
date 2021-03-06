
var warn = require("../tools/tools").warn;

function doCommand (command, interpreter, args) {
    
    var assetName, action, bus = interpreter.bus, assets = interpreter.assets;
    
    args = args || {};
    
    bus.trigger(
        "wse.interpreter.commands.do",
        {
            interpreter: interpreter,
            command: command
        }, 
        false
    );
    
    assetName = command.getAttribute("asset");
    action = command.getAttribute("action");
    
    if (assetName === null) {
        warn(bus, "Element of type 'do' must have an attribute 'asset'. " +
            "Element ignored.", command);
        return;
    }
    
    if (action === null) {
        warn(bus, "Element of type 'do' must have an attribute 'action'." +
            " Element ignored.", command);
        return;
    }
    
    if (typeof assets[assetName] === "undefined" || assets[assetName] === null) {
        warn(bus, "Reference to unknown asset '" + assetName + "'.", command);
        return {
            doNext: true
        };
    }
    
    if (typeof assets[assetName][action] === "undefined") {
        warn(bus, "Action '" + action + "' is not defined for asset '" +
            assetName + "'.", command);
        return {
            doNext: true
        };
    }
    
    return assets[assetName][action](command, args);
}

module.exports = doCommand;
