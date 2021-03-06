/* global WSE */

(function () {
    
/**
 * An extension that adds side-image capabilities.
 * When on a character asset an attribute imagepack is set,
 * the ImagePack referenced by the attribute will be displayed whenever
 * the character says something and hidden when someone else
 * says something.
 */
function makeToggleSideImagesFn (game) {
    
    var lastSpeakerName = '', fn;
    
    fn = function (data) {
        
        var speaker, speakerName, lastSpeaker, ip, ipName, assets, lastIp;
        
        assets = game.interpreter.assets;
        speakerName = data.command.getAttribute('s');
        speaker = assets[speakerName];
        ipName = speaker.asset.getAttribute('imagepack');
        
        //console.log('speakerName: ' + speakerName);
        //console.log('lastSpeakerName: ' + lastSpeakerName);
        
        if (lastSpeakerName == speakerName) {
            return;
        }
        
        if (lastSpeakerName !== '') {
            
            lastSpeaker = assets[lastSpeakerName];
            lastIp = assets[lastSpeaker.asset.getAttribute('imagepack')];
            
            if (lastIp) {
                lastIp.hide(data.command, {});
            }
        }
        
        lastSpeakerName = speakerName;
        
        if (!ipName) {
            return;
        }
        
        ip = assets[ipName];
        
        ip.show(data.command, {});
    };
    
    game.bus.subscribe(function () { lastSpeakerName = ''; }, 'wse.interpreter.restart');
    
    return fn;
}

WSE.bus.subscribe("wse.game.constructor", function (data) {
    data.game.bus.subscribe(makeToggleSideImagesFn(data.game), 'wse.interpreter.commands.line');
});

}());
