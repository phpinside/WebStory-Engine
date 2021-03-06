
var transform = require("transform-js").transform;
var classes = require("class-manipulator").list;

var tools = require("../tools/tools");
var reveal = require("../tools/reveal");
var DisplayObject = require("../DisplayObject");

var truthy = tools.truthy;
var replaceVars = tools.replaceVariables;

function Textbox (asset) {
    
    this.z = 1000;
    
    DisplayObject.apply(this, arguments);
    
    var element, nameElement, textElement;
    
    this.type = asset.getAttribute("behaviour") || "adv";
    this.showNames = truthy(asset.getAttribute("namebox"));
    this.nltobr = truthy(asset.getAttribute("nltobr"));
    this.cssid = this.cssid || "wse_textbox_" + this.name;
    this.effectType = asset.getAttribute("effect") || "typewriter";
    this.speed = asset.getAttribute("speed") || 0;
    this.speed = parseInt(this.speed, 10);
    this.fadeDuration = asset.getAttribute("fadeDuration") || 0;
    
    (function (ctx) {
        
        var el, i, len, elms;
        
        try {
            
            elms = asset.childNodes;
            
            for (i = 0, len = elms.length; i < len; i += 1) {
                
                if (elms[i].nodeType === 1 && elms[i].tagName === 'nameTemplate') {
                    el = elms[i];
                    break;
                }
            }
            
            if (!el) {
                throw new Error('No nameTemplate found.');
            }
            
            ctx.nameTemplate = new XMLSerializer().serializeToString(el);
        }
        catch (e) {
            ctx.nameTemplate = '{name}: ';
        }
    }(this));
    
    if (this.type === "nvl") {
        this.showNames = false;
    }
    
    element = this.element;
    nameElement = document.createElement("div");
    textElement = document.createElement("div");
    
    element.setAttribute("class", "asset textbox");
    textElement.setAttribute("class", "text");
    nameElement.setAttribute("class", "name");
    
    element.appendChild(nameElement);
    element.appendChild(textElement);
    
    if (this.showNames === false) {
        nameElement.style.display = "none";
    }
    
    nameElement.setAttribute("id", this.cssid + "_name");
    textElement.setAttribute("id", this.cssid + "_text");
    
    this.nameElement = this.cssid + "_name";
    this.textElement = this.cssid + "_text";
    
    element.style.opacity = 0;
    
    this.bus.trigger("wse.assets.textbox.constructor", this);
}

Textbox.prototype = Object.create(DisplayObject.prototype);

Textbox.prototype.put = function (text, name, speakerId) {
    
    var textElement, nameElement, namePart, self, cssClass = "wse_no_character", element;
    
    name = name || null;
    speakerId = speakerId || "_no_one";
    
    self = this;
    textElement = document.getElementById(this.textElement);
    nameElement = document.getElementById(this.nameElement);
    element = document.getElementById(this.cssid);
    
    text = replaceVars(text, this.interpreter);
    
    self.interpreter.waitCounter += 1;
    
    namePart = "";
    
    if (this.showNames === false && !(!name)) {
        namePart = this.nameTemplate.replace(/\{name\}/g, name);
    }
    
    if (name === null) {
        
        if (this.showNames) {
            nameElement.style.display = "none";
        }
        
        name = "";
    }
    else {
        
        if (this.showNames) {
            nameElement.style.display = "";
        }
        
        cssClass = "wse_character_" + speakerId.split(" ").join("_");
    }
    
    if (this._lastCssClass) {
        classes(element).remove(this._lastCssClass).apply();
    }
    
    this._lastCssClass = cssClass;
    
    classes(element).add(cssClass).apply();
    
    if (this.speed < 1) {
        
        if (this.fadeDuration > 0) {
            
            self.interpreter.waitCounter += 1;
            
            (function () {
                
                var valFn, finishFn, options;
                
                valFn = function (v) {
                    textElement.style.opacity = v;
                };
                
                finishFn = function () {
                    self.interpreter.waitCounter -= 1;
                };
                
                options = {
                    duration: self.fadeDuration
                };
                
                transform(1, 0, valFn, options, finishFn);
            }());
        }
        else {
            putText();
        }
    }
    
    if (this.speed > 0) {
        
        if (self.type === 'adv') {
            textElement.innerHTML = "";
        }
        
        (function () {
            
            var container;
            
            container = document.createElement('div');
            container.setAttribute('class', 'line');
            textElement.appendChild(container);
            container.innerHTML = namePart + text;
            nameElement.innerHTML = self.nameTemplate.replace(/\{name\}/g, name);
            //self.interpreter.waitCounter += 1;
            
            self.interpreter.cancelCharAnimation = reveal(
                container, 
                { 
                    speed: self.speed,
                    onFinish: function () {
                        //self.interpreter.waitCounter -= 1; 
                        self.interpreter.cancelCharAnimation = null;
                    }
                }
            ).cancel;
        }());
    }
    else if (this.fadeDuration > 0) {
        
        self.interpreter.waitCounter += 1;
        
        setTimeout(
            function () {
                
                putText();
                
                if (self.type === 'nvl') {
                    textElement.innerHTML = '<div>' + textElement.innerHTML + '</div>';
                }
                
                transform(
                    0,
                    1,
                    function (v) {
                        textElement.style.opacity = v;
                    },
                    {
                        duration: self.fadeDuration,
                        onFinish: function () {
                            self.interpreter.waitCounter -= 1;
                        }
                    }
                );
            },
            self.fadeDuration
        );
    }
    
    this.bus.trigger("wse.assets.textbox.put", this, false);
    self.interpreter.waitCounter -= 1;
    
    return {
        doNext: false
    };
    
    function putText () {
        
        if (self.type === 'adv') {
            textElement.innerHTML = "";
        }
        
        textElement.innerHTML += namePart + text;
        nameElement.innerHTML = self.nameTemplate.replace(/\{name\}/g, name);
    }
};

Textbox.prototype.clear = function () {
    
    document.getElementById(this.textElement).innerHTML = "";
    document.getElementById(this.nameElement).innerHTML = "";
    this.bus.trigger("wse.assets.textbox.clear", this);
    
    return {
        doNext: true
    };
};

Textbox.prototype.save = function () {
    
    return {
        assetType: "Textbox",
        type: this.type,
        showNames: this.showNames,
        nltobr: this.nltobr,
        cssid: this.cssid,
        nameElement: this.nameElement,
        textElement: this.textElement,
        z: this.z
    };
};

Textbox.prototype.restore = function (save) {
    
    this.type = save.type;
    this.showNames = save.showNames;
    this.nltobr = save.nltobr;
    this.cssid = save.cssid;
    this.nameElement = save.nameElement;
    this.textElement = save.textElement;
    this.z = save.z;
    
    document.getElementById(this.cssid).style.zIndex = this.z;
};

module.exports = Textbox;
