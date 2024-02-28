function listTargetMethods(clsName) {
    const cls = Java.use(clsName);
    var targetMethods = [];
    
    try {
        cls.$init.overload();  // default constructor
    } catch (err) {
        return false;
    }

    const methods = cls.class.getDeclaredMethods();
    for (var i=0; i < methods.length; i++) {
        // find public methods that has name starts with "set"

        const s = methods[i];
        const sig = s.toString();  // public void vantangepoint.sg.fastjson_test.MyObj.setDebug(java.lang.String)

        if (!sig.startsWith('public')) {
            continue;
        }


        var splitSpaceArr = sig.split(' ');
        var temp = splitSpaceArr[splitSpaceArr.length - 1];
        // console.log(splitSpaceArr);
        while (splitSpaceArr && temp[temp.length - 1] != ')') {
            // console.log(splitSpaceArr[splitSpaceArr.length - 1][-1]);
            splitSpaceArr.pop();
            temp = splitSpaceArr[splitSpaceArr.length - 1];
            // console.log(splitSpaceArr);
        }
        const splitBracketArr = splitSpaceArr[splitSpaceArr.length - 1].split('(');
        const splitDotArr = splitBracketArr[0].split('.');
        const methodName = splitDotArr[splitDotArr.length - 1];

        if (splitBracketArr.length == 1) {
            console.log(sig);
        }
        const noArgs = splitBracketArr[1].length == 1;
        const oneArg = !noArgs && splitBracketArr[1].indexOf(",") == -1;
        const isStatic = splitSpaceArr.indexOf("static") != -1;
        
        if (isStatic) {
            continue;
        }

        if (methodName.startsWith('set') && oneArg) {
            targetMethods.push(methodName);
        } else if (methodName.startsWith('get') && noArgs) {
            targetMethods.push(methodName);
        }
    }
    if (targetMethods.length > 0) {
        console.log(clsName);
        send(JSON.stringify({'class-name': clsName, 'methods': targetMethods}));
    }
}

Java.perform(() => {
    const clsNameArr = REPLACE-THIS-FROM-PY;
    clsNameArr.forEach(function(clsName) {
        try {
            listTargetMethods(clsName);
        } catch (err) {
            console.log(err);
        }
    });
})
