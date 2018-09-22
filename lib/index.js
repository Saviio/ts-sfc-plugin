"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var JsxType;
(function (JsxType) {
    JsxType[JsxType["SelfClosing"] = 0] = "SelfClosing";
    JsxType[JsxType["Standard"] = 1] = "Standard";
})(JsxType || (JsxType = {}));
var Flag;
(function (Flag) {
    Flag[Flag["Initial"] = 0] = "Initial";
    Flag[Flag["Opt"] = 2] = "Opt";
    Flag[Flag["Deopt"] = 10] = "Deopt";
})(Flag || (Flag = {}));
var createObjectAssign = function (params) {
    return ts.createCall(ts.createPropertyAccess(ts.createIdentifier('Object'), 'assign'), [], [
        ts.createObjectLiteral()
    ].concat(params));
};
var transformToProperties = function (node) {
    var ret = [];
    node.getChildren().forEach(function (childNode) {
        if (ts.isJsxText(childNode)) {
            return;
        }
        if (ts.isJsxExpression(childNode)) {
            ret.push(childNode.getChildAt(1));
            return;
        }
        var editedNode = ts.getMutableClone(childNode);
        editedNode.edited = true;
        ret.push(editedNode);
    });
    return ret;
};
var transformToPropertyAssignment = function (attrs) {
    return attrs.reduce(function (acc, curr) {
        var identifier = curr.getChildAt(0).getText();
        var jsxExpr = curr.getChildAt(2);
        acc.push(ts.createPropertyAssignment(ts.createIdentifier(identifier), jsxExpr.getChildAt(1)));
        return acc;
    }, []);
};
function createTransformer(option) {
    var defaultOptions = {
        pragma: 'sfc',
        mode: 1
    };
    var transformerOptions = Object.assign({}, defaultOptions, option);
    var transformer = function (context) {
        var visitor = function (node) {
            if (!ts.isJsxElement(node) && !ts.isJsxSelfClosingElement(node)) {
                return ts.visitEachChild(node, visitor, context);
            }
            var currentJsxNode = node;
            var JsxNodeType = ts.isJsxSelfClosingElement(currentJsxNode)
                ? JsxType.SelfClosing
                : JsxType.Standard;
            var attributes = JsxNodeType === JsxType.SelfClosing
                ? currentJsxNode.getChildAt(2)
                : currentJsxNode.openingElement.getChildAt(2);
            var functionIdentifier = JsxNodeType === JsxType.SelfClosing
                ? node.getChildAt(1).getText()
                : currentJsxNode.openingElement.getChildAt(1).getText();
            var spreadAttrs = [];
            var attrs = [];
            var shouldOptmize = Flag.Initial;
            attributes.forEachChild(function (child) {
                var attrbute = child;
                if (ts.isJsxSpreadAttribute(attrbute)) {
                    spreadAttrs.push(attrbute.getChildAt(2));
                    if (transformerOptions.mode == 1) {
                        shouldOptmize |= Flag.Deopt;
                    }
                }
                else {
                    // branch: JsxAttribute
                    var attrIdentifier = attrbute.name.getText().trim();
                    if (attrIdentifier === 'key' && transformerOptions.mode === 1) {
                        shouldOptmize |= Flag.Deopt;
                    }
                    if (attrIdentifier === transformerOptions.pragma) {
                        if (attrbute.getChildCount() === 1) {
                            // handle:
                            // e.g. <Avatar sfc />
                            shouldOptmize |= Flag.Opt;
                        }
                        else {
                            // handle:
                            // e.g. <Avatar sfc={ true } />
                            // p.s. this branch meet attrbute.getChildCount() >= 2
                            if (/\{\s*true\s*\}/.test(attrbute.getChildAt(2).getText())) {
                                shouldOptmize |= Flag.Opt;
                            }
                        }
                    }
                    else {
                        if (!(transformerOptions.mode === 2 && attrIdentifier === 'key')) {
                            attrs.push(attrbute);
                        }
                    }
                }
            });
            if (shouldOptmize === Flag.Opt) {
                var params = [];
                if (JsxNodeType === JsxType.Standard) {
                    // ast: JsxElement -> SyntaxList
                    var children = transformToProperties(currentJsxNode.getChildAt(1));
                    var standaloneAttrs = transformToPropertyAssignment(attrs);
                    var assignNode = createObjectAssign(spreadAttrs.concat([
                        ts.createObjectLiteral([
                            ts.createPropertyAssignment(ts.createIdentifier('children'), ts.createArrayLiteral(children))
                        ].concat(standaloneAttrs))
                    ]));
                    params.push(assignNode);
                }
                else {
                    // avoid following case:
                    // <div { ...params } /> -> div(Object.assign({}, params))
                    //
                    // it will be:
                    // <div { ...params } /> -> div(params)
                    if (spreadAttrs.length === 1 && attrs.length === 0) {
                        params.push.apply(params, spreadAttrs);
                    }
                    else if (spreadAttrs.length > 0 || attrs.length > 0) {
                        var assignArgs = [];
                        if (spreadAttrs.length > 0) {
                            assignArgs.push.apply(assignArgs, spreadAttrs);
                        }
                        if (attrs.length > 0) {
                            assignArgs.push(ts.createObjectLiteral(transformToPropertyAssignment(attrs).slice()));
                        }
                        /* istanbul ignore else */
                        if (assignArgs.length > 0) {
                            params.push(createObjectAssign(assignArgs));
                        }
                    }
                }
                var identifier = ts.createIdentifier(functionIdentifier);
                var callExpr = ts.createCall(identifier, [], params);
                if (ts.isJsxElement(node.parent) && !node.edited) {
                    return ts.visitEachChild(ts.createJsxExpression(undefined, callExpr), visitor, context);
                }
                return ts.visitEachChild(callExpr, visitor, context);
            }
            var editedAttributes = attributes.getChildAt(0).getChildren().filter(function (c) {
                if (ts.isJsxAttribute(c) && c.name.getText().trim() === transformerOptions.pragma) {
                    return false;
                }
                return true;
            });
            if (ts.isJsxSelfClosingElement(currentJsxNode)) {
                currentJsxNode.attributes = ts.updateJsxAttributes(attributes, editedAttributes);
                return ts.visitEachChild(currentJsxNode, visitor, context);
            }
            else {
                currentJsxNode.openingElement.attributes = ts.updateJsxAttributes(attributes, editedAttributes);
                return ts.visitEachChild(currentJsxNode, visitor, context);
            }
        };
        return function (node) { return ts.visitNode(node, visitor); };
    };
    return transformer;
}
exports.createTransformer = createTransformer;
exports.default = createTransformer;
//# sourceMappingURL=index.js.map