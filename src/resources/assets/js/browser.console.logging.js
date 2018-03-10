/**
 * Browser console logging helper
 * @returns {boolean}
 */
function objExists(objToTest) {
    return !_.isNull(objToTest) && !_.isUndefined(objToTest);
}

/**
 * Debugging vars and functionality
 */
{
    // When App.Vars.bAllowConsoleOutput = 1, the console log output can be overwhelming.
    // To only see the output from specific functions, add the function name to the aLimitLog array
    App.Vars.aLimitLog = [];//[];
    App.Vars.aVarsDebugGroups = ['App.Vars.CollectionsGroup', 'App.Vars.ModelsGroup', 'App.Vars.SettingsGroup'];
    App.Vars.bAllowConsoleTrace = false;
    App.Vars.ajaxCalls = {};
    // Number increment for the console debug calls
    App.Vars.iOrderOfExecution = 0;
    App.Vars.aLogColors = {
        'red': 'color:red;',
        'green': 'color:green;',
        'blue': 'color:blue;',
        'black': 'color:black;',
        'purple': 'color:purple;',
        'orange': 'color:orange;',
        'teal': 'color:teal;'
    };
    // Styles the console.debug for high lighting output
    App.Vars.sLogStyles = 'background-color: yellow; font-weight: bolder; font-family: arial;'
    // override console.debug so I can force some logs to stand out as errors
    if (App.Vars.bAllowConsoleOutput && App.Vars.bAllowConsoleOutputHiLite) {
        (function () {
            let exConsoleDebug = console.debug;
            let exConsoleError = console.error;
            let aHiLiteLog = ['manageChangedAddressEvents'];
            let oHiLiteArg = {'manageChangedAddressEvents': ['pageUpdateStarted', 'pageUpdateModifyModalMsg', 'pageUpdateDone']}
            // The log color will default to red unless it's customize here
            let aHiLiteLogColor = {'pageUpdateDone': 'teal'};
            console.debug = function (msg) {
                App.Vars.iOrderOfExecution++;
                let callTime = window.performance.now().toFixed(2);
                let sOrderOfExecution = App.Vars.iOrderOfExecution + '(' + callTime + ') ';
                // Prepend an order of execution string to each log

                //console.log('console.debug',console.debug)
                let args = _.values(arguments);
                let sFakeMethod = objExists(args[0]) ? args[0] : false;
                //console.log('console.debug', sFakeMethodZero, sFakeMethodOne, typeof args[0], args[0]);
                [].unshift.call(arguments, sOrderOfExecution);
                if (sFakeMethod) {
                    if ((aHiLiteLog.length === 0 || (aHiLiteLog.length && -1 !== $.inArray(sFakeMethod, aHiLiteLog)))) {
                        let sHiLiteColorKey = sFakeMethod;
                        let bRequiresAdditionalArgsForError = typeof oHiLiteArg[sFakeMethod] !== 'undefined';
                        let bFormatLog = !bRequiresAdditionalArgsForError || (bRequiresAdditionalArgsForError && (function (a1, a2) {
                            let a1Length = a1.length;
                            for (let i = 0; i < a1Length; i++) {
                                if (-1 !== $.inArray(a1[i], a2)) {
                                    sHiLiteColorKey = a1[i];
                                    return true;
                                }
                            }
                            return false;
                        })(oHiLiteArg[sFakeMethod], arguments));

                        if (bFormatLog) {
                            // concat first two array elements for formatting so it stands out more
                            let tmpArg = arguments[0];
                            [].shift.call(arguments);
                            arguments[0] = "%c" + tmpArg + arguments[0];
                            let sLogColor = typeof aHiLiteLogColor[sHiLiteColorKey] !== 'undefined' && typeof App.Vars.aLogColors[aHiLiteLogColor[sHiLiteColorKey]] !== 'undefined' ? App.Vars.aLogColors[aHiLiteLogColor[sHiLiteColorKey]] : App.Vars.aLogColors.purple;
                            [].splice.call(arguments, 1, 0, sLogColor + App.Vars.sLogStyles);
                            exConsoleDebug.apply(this, arguments);
                            return;
                        }
                    }
                }
                exConsoleDebug.apply(this, arguments);
            }
        })()
    }
}

/**
 * Browser console logging helper.
 * Required to be called from a function
 * @returns {boolean}
 */
function allowConsoleOutput(calledFrom) {
    //console.log('App.Vars.bAllowConsoleOutput:'+App.Vars.bAllowConsoleOutput,'calledFromGroup:'+ calledFrom, allowConsoleOutput)
    if (App.Vars.bAllowConsoleOutput) {
        let bCheckCalledFrom = objExists(calledFrom) && calledFrom !== '';
        if (!bCheckCalledFrom) {
            return true;
        } else if (bCheckCalledFrom && (App.Vars.aLimitLog.length === 0 || (App.Vars.aLimitLog.length && -1 !== $.inArray(calledFrom, App.Vars.aLimitLog)))) {
            if (!App.Vars.bAllowConsoleVarGroupsOutput && -1 !== $.inArray(calledFrom, App.Vars.aVarsDebugGroups)) {
                return false;
            }
            return true;
        }
    }
    return false;
}

/**
 * Browser console logging helper.
 * @returns {boolean}
 */
window._log = function() {

    if (allowConsoleOutput(arguments[0])) {
        // Sends the first parameter to represent the calledFrom method
        let args = _.values(arguments);
        let calledFrom = args.shift();
        console.debug(calledFrom, args)
    }
};
