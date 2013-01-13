(function (out)
{
    out.commands.global = function (command, interpreter)
    {
        var name, value;

        name = command.getAttribute("name") || null;
        value = command.getAttribute("value") || null;

        if (name === null)
        {
            interpreter.bus.trigger(
                "wse.interpreter.warning",
                {
                    element: command,
                    message: "No name defined on element 'global'."
                }
            );
            
            return {
                doNext: true
            };
        }

        if (value === null)
        {
            interpreter.bus.trigger(
                "wse.interpreter.warning",
                {
                    element: command,
                    message: "No value defined on element 'global'."
                }
            );
            
            return {
                doNext: true
            };
        }

        interpreter.globalVars.set(name, value);

        return {
            doNext: true
        };
    };    
}(WSE));