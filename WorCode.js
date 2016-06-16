var WorCode = (function(document) {
    var interpreter = {
        datatype: {
            primary: {
                "char": {
                    maxlength: 1,
                    accept: "text"
                },
                "int": {
                    maxlength: 11,
                    accept: "integer"
                },
                "float": {
                    maxlength: 11,
                    accept: "float"
                },
                "double": {
                    maxlength: 11,
                    accept: "float"
                },
                "string": {
                    maxlength: 0,
                    accept: "text"
                },
                "boolean": {
                    maxlength: 0,
                    accept: "boolean"
                },
            },
            composite: ["array", "dictionary", "object"]
        },
        console: null,
        code: "",
        lines: null,
        variables: {},
        printQueue: [],
        extract: function() {
            var extracting = interpreter.code.split('\n');
            if (extracting) {
                interpreter.lines = extracting;
            } else {
                console.log("Code is empty.");
            }
        },
        read: function() {
            interpreter.extract();
            var statements = [];
            var isCondition = false;
            var ifStatement = "";
            for (var line in interpreter.lines) {
                var code = interpreter.lines[line];
                var _isPrimary = interpreter.isPrimary(code);
                if (_isPrimary) {
                    if (isCondition) {
                        ifStatement += _isPrimary + ";";
                    } else {
                        statements.push(_isPrimary + ";");
                    }
                    continue;
                }
                var _isComposite = interpreter.isComposite(code);
                if (_isComposite) {
                    if (isCondition) {
                        ifStatement += _isPrimary + ";";
                    } else {
                        statements.push(_isComposite + ";");
                    }
                    continue;
                }
                var _isVariable = interpreter.isVariable(code);
                if (_isVariable) {
                    if (isCondition) {
                        ifStatement += _isVariable + ";";
                    } else {
                        statements.push(_isVariable + ";");
                    }
                    continue;
                }
                var _isPrint = interpreter.isPrint(code);
                if (_isPrint) {
                    statements.push(_isPrint + ";");
                    continue;
                } else {
                    var regexCond = /(if|elseif|else|endif) \((.*)\)/g;
                    var cond = regexCond.exec(code);
                    if (cond) {
                        if (cond[0] === "if") {
                            isCondition.push(true);
                            ifStatement += "if(" + cond[1] + "){";
                        } else if (cond[0] === "elseif") {
                            isCondition.push(true);
                            ifStatement += "} else if(" + cond[1] + "){";
                        } else if (cond[0] === "else") {
                            isCondition.push(true);
                            ifStatement += "} else {";
                        } else if (cond[0] === "endif" && isCondition) {
                            ifStatement += "}";
                            statements.push(ifStatement);
                            ifStatement = "";
                        }
                    }
                }
            }
            interpreter.readStatement(statements);
        },
        isPrimary: function(code) {
            var regexCode = /(\w+) (\W*|\w) (=) (.*)/g;
            var extracted = regexCode.exec(code);
            var types = interpreter.datatype.primary;
            var validType = null;
            if (extracted) {
                extracted.shift();
                for (var type in types) {
                    if (extracted[0] == type) {
                        validType = types[type];
                        break;
                    }
                }
                if (validType) {
                    extracted[0] = "var";
                }
                return extracted.join(" ");
            }
            return null;
        },
        isComposite: function(code) {
            var regexCode = /(\w+) (\W*|\w) (=) (.*)/g;
            var extracted = regexCode.exec(code);
            var types = interpreter.datatype.composite;
            var validType = null;
            if (extracted) {
                extracted.shift();
                for (var type in types) {
                    if (extracted[0] == type) {
                        validType = types[type];
                        break;
                    }
                }
                if (validType) {
                    extracted[0] = "var";
                }
                return extracted.join(" ");
            }
            return null;
        },
        isVariable: function(code) {
            var regexCode = /(\w+) (\W*|\w) (.*)/g;
            var extracted = regexCode.exec(code);
            if (extracted) {
                extracted.shift();
                return extracted.join(" ");
            }
            return null;
        },
        isPrint: function(code) {
            var regexCode = /(\w+) (.*)/g;
            var extracted = regexCode.exec(code);
            if (extracted) {
                extracted.shift();
                if (extracted[0] === "print") return "$.print(" + extracted[1] + ")";
            }
            return null;
        },
        readStatement: function(lines) {
            //var program = lines.join(";");
            (function($, i, c) {
                $ = $;
                i = i;
                for (var idx in c) {
                    try {
                        eval(c[idx]);
                    } catch (e) {
                        console.log(e);
                        var stack = e.stack;
                        stack = stack.replace(/( at )/g, "<br/> at ");
                        $.printError(e.messages);
                        $.printError(stack);
                    }
                }
            })($, interpreter, lines);
        },
    };
    var $ = {
        interpreter: null,
        config: {
            editor: null,
            console: null,
            errors: null,
        },
        init: function(c) {
        	$.config.editor = document.getElementById("editor");
        	$.config.console = document.getElementById("console");
        	$.config.errors = document.getElementById("errors");
            if (c) {
                if (c.editor) {
                    $.config.editor = document.getElementById(c.editor);
                }
                if (c.console) {
                    $.config.console = document.getElementById(c.console);
                }
                if (c.errors) {
                    $.config.errors = document.getElementById(c.errors);
                }
            }
            $.interpreter = interpreter;
        },
        setEditor: function(element) {
            $.config.editor = element;
        },
        setConsole: function(element) {
            $.config.console = element;
        },
        execute: function() {
            if ($.interpreter) {
            	//$.clear();
                $.interpreter.console = $.config.console;
                $.interpreter.code = $.config.editor.value;
                $.interpreter.read();
            } else {
                console.log("Intepreter is not define.");
                $.printError("Intepreter is not define.");
            }
        },
        clear: function() {
            $.config.console.innerHTML = "";
        },
        print: function(text) {
            $.config.console.innerHTML += "<br/>" + text;
        },
        clearError: function() {
            $.config.errors.innerHTML = "";
        },
        printError: function(text) {
            $.config.errors.innerHTML += "<br/>" + text;
        },
    };
    return $;
})(document);