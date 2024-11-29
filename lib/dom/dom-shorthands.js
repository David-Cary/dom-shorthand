"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDOMShorthand = exports.getShorthandContentDescription = exports.shorthandToHTML = exports.shorthandToDOMDescription = exports.addChildNodesToShorthand = exports.DOMDescriptionToShorthand = void 0;
var dom_nodes_1 = require("./dom-nodes");
/**
 * Converts a more detailed DOM Node description to a shorter, more type-specific form.
 * @function
 * @param {DOMNodeDescription | DOMElementDescription} desciption - json friendly description of the target node
 * @returns {DOMNodeShorthand | undefined} resulting short form description of the node
 */
function DOMDescriptionToShorthand(description) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    switch (description.nodeType) {
        case dom_nodes_1.NodeType.TEXT_NODE: {
            return (_a = description.nodeValue) !== null && _a !== void 0 ? _a : '';
        }
        case dom_nodes_1.NodeType.ELEMENT_NODE: {
            var shorthand = {
                tag: (_b = description.nodeName) !== null && _b !== void 0 ? _b : ''
            };
            if ('attributes' in description && description.attributes != null) {
                shorthand.attributes = __assign({}, description.attributes);
            }
            addChildNodesToShorthand(description, shorthand);
            return shorthand;
        }
        case dom_nodes_1.NodeType.ATTRIBUTE_NODE: {
            return {
                name: (_c = description.nodeName) !== null && _c !== void 0 ? _c : '',
                value: (_d = description.nodeValue) !== null && _d !== void 0 ? _d : null
            };
        }
        case dom_nodes_1.NodeType.CDATA_SECTION_NODE: {
            return {
                cData: (_e = description.nodeValue) !== null && _e !== void 0 ? _e : ''
            };
        }
        case dom_nodes_1.NodeType.COMMENT_NODE: {
            return {
                comment: (_f = description.nodeValue) !== null && _f !== void 0 ? _f : ''
            };
        }
        case dom_nodes_1.NodeType.PROCESSING_INSTRUCTION_NODE: {
            return {
                target: (_g = description.nodeName) !== null && _g !== void 0 ? _g : '',
                data: (_h = description.nodeValue) !== null && _h !== void 0 ? _h : ''
            };
        }
        case dom_nodes_1.NodeType.DOCUMENT_FRAGMENT_NODE: {
            var shorthand = {};
            addChildNodesToShorthand(description, shorthand);
            return shorthand;
        }
    }
}
exports.DOMDescriptionToShorthand = DOMDescriptionToShorthand;
/**
 * Copies child node descriptions from the parent node description to it's shorthand.
 * @function
 * @param {DOMNodeDescription} desciption - parent node's description
 * @param {DOMElementShorthand | DOMFragmentShorthand} shorthand - location the children should be copied to
 */
function addChildNodesToShorthand(description, shorthand) {
    if (description.childNodes != null) {
        shorthand.content = [];
        for (var _i = 0, _a = description.childNodes; _i < _a.length; _i++) {
            var childDescription = _a[_i];
            var childShorthand = DOMDescriptionToShorthand(childDescription);
            if (childShorthand != null) {
                shorthand.content.push(childShorthand);
            }
        }
    }
}
exports.addChildNodesToShorthand = addChildNodesToShorthand;
/**
 * Converts an abbreviated DOM Node description back into it's more detailed and less type specific form.
 * @function
 * @param {DOMNodeShorthand} shorthand - abbreviated description to be converted
 * @returns {DOMNodeShorthand} resulting expanded node description
 */
function shorthandToDOMDescription(shorthand) {
    if (typeof shorthand === 'string') {
        return (0, dom_nodes_1.createTextNodeDescription)(shorthand);
    }
    if ('tag' in shorthand) {
        var childNodes_1 = getShorthandContentDescription(shorthand);
        return (0, dom_nodes_1.createElementDescription)(shorthand.tag, shorthand.attributes, childNodes_1);
    }
    if ('name' in shorthand && 'value' in shorthand) {
        return (0, dom_nodes_1.createAttributeDescription)(shorthand.name, shorthand.value);
    }
    if ('cData' in shorthand) {
        return (0, dom_nodes_1.createCDataDescription)(shorthand.cData);
    }
    if ('target' in shorthand && 'data' in shorthand) {
        return (0, dom_nodes_1.createProcessingInstructionDescription)(shorthand.target, shorthand.data);
    }
    if ('comment' in shorthand) {
        return (0, dom_nodes_1.createCommentDescription)(shorthand.comment);
    }
    var childNodes = getShorthandContentDescription(shorthand);
    return (0, dom_nodes_1.createFragmentDescription)(childNodes);
}
exports.shorthandToDOMDescription = shorthandToDOMDescription;
/**
 * Converts an abbreviated DOM Node description to HTML text.
 * @function
 * @param {DOMNodeShorthand} shorthand - abbreviated description to be converted
 * @returns {string} resulting html
 */
function shorthandToHTML(shorthand) {
    if (typeof shorthand === 'string') {
        return shorthand;
    }
    if ('tag' in shorthand) {
        var html = "<".concat(shorthand.tag);
        if ('attributes' in shorthand) {
            for (var key in shorthand.attributes) {
                var value = shorthand.attributes[key];
                html += " ".concat(key, "=\"").concat(value, "\"");
            }
        }
        html += '>';
        if ('content' in shorthand && shorthand.content != null) {
            for (var _i = 0, _a = shorthand.content; _i < _a.length; _i++) {
                var item = _a[_i];
                html += shorthandToHTML(item);
            }
        }
        html += "</".concat(shorthand.tag, ">");
        return html;
    }
    if ('content' in shorthand && shorthand.content != null) {
        var html = '';
        for (var _b = 0, _c = shorthand.content; _b < _c.length; _b++) {
            var item = _c[_b];
            html += shorthandToHTML(item);
        }
        return html;
    }
    if ('comment' in shorthand) {
        return "<!--".concat(shorthand.comment, "-->");
    }
    if ('cData' in shorthand) {
        return "<![CDATA[".concat(shorthand.cData, "]]>");
    }
    if ('target' in shorthand && 'data' in shorthand) {
        return "<!--".concat(shorthand.target, " ").concat(shorthand.data, "-->");
    }
    if ('name' in shorthand && 'value' in shorthand) {
        return "".concat(shorthand.name, "=\"").concat(shorthand.value, "\"");
    }
    return '';
}
exports.shorthandToHTML = shorthandToHTML;
/**
 * Tries to retrieve and convert the contents of a DOM Node shorthand to their expanded forms.
 * @function
 * @param {DOMElementShorthand | DOMFragmentShorthand} desciption - node shorthand that can have contents
 * @returns {DOMNodeDescription[] | undefined} resulting child node descriptions
 */
function getShorthandContentDescription(shorthand) {
    if (shorthand.content != null) {
        var childNodes = [];
        for (var _i = 0, _a = shorthand.content; _i < _a.length; _i++) {
            var childShorthand = _a[_i];
            var childDescription = shorthandToDOMDescription(childShorthand);
            if (childDescription != null) {
                childNodes.push(childDescription);
            }
        }
        return childNodes;
    }
}
exports.getShorthandContentDescription = getShorthandContentDescription;
/**
 * Tries to cast the provided data to an appropriate DOM Node shorthand.
 * @function
 * @param {unknown} target - data to be recast
 * @returns {DOMNodeShorthand | undefined} provided target if valid or undefined if invalid
 */
function validateDOMShorthand(target) {
    switch (typeof target) {
        case 'string': {
            return target;
        }
        case 'object': {
            if (target != null) {
                if ('tag' in target) {
                    return target;
                }
                if ('name' in target && 'value' in target) {
                    return target;
                }
                if ('cData' in target) {
                    return target;
                }
                if ('target' in target && 'data' in target) {
                    return target;
                }
                if ('comment' in target) {
                    return target;
                }
                var keys = Object.keys(target);
                if (keys.length < 1 ||
                    (keys.length === 1 && keys[0] === 'content')) {
                    return target;
                }
            }
            break;
        }
    }
}
exports.validateDOMShorthand = validateDOMShorthand;
