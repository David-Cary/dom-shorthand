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
exports.createFragmentDescription = exports.createProcessingInstructionDescription = exports.createCDataDescription = exports.createCommentDescription = exports.createTextNodeDescription = exports.createAttributeDescription = exports.createElementDescription = exports.FixedNodeTypeNames = exports.setElementAttributes = exports.appendDescribedChildNodes = exports.createDescribedNode = exports.describeElementAttributes = exports.describeNodeList = exports.describeNode = exports.NodeType = void 0;
/**
 * These are the possible nodeType values for a DOM Node packed in an enum.
 * @readonly
 * @enum {number}
 */
var NodeType;
(function (NodeType) {
    NodeType[NodeType["ELEMENT_NODE"] = 1] = "ELEMENT_NODE";
    NodeType[NodeType["ATTRIBUTE_NODE"] = 2] = "ATTRIBUTE_NODE";
    NodeType[NodeType["TEXT_NODE"] = 3] = "TEXT_NODE";
    NodeType[NodeType["CDATA_SECTION_NODE"] = 4] = "CDATA_SECTION_NODE";
    NodeType[NodeType["PROCESSING_INSTRUCTION_NODE"] = 7] = "PROCESSING_INSTRUCTION_NODE";
    NodeType[NodeType["COMMENT_NODE"] = 8] = "COMMENT_NODE";
    NodeType[NodeType["DOCUMENT_NODE"] = 9] = "DOCUMENT_NODE";
    NodeType[NodeType["DOCUMENT_TYPE_NODE"] = 10] = "DOCUMENT_TYPE_NODE";
    NodeType[NodeType["DOCUMENT_FRAGMENT_NODE"] = 11] = "DOCUMENT_FRAGMENT_NODE";
})(NodeType || (exports.NodeType = NodeType = {}));
/**
 * Converts a DOM Node to json friendly summary.
 * @function
 * @param {Node} node - node to be converted
 * @returns {DOMNodeDescription} resulting summary
 */
function describeNode(node) {
    var description = {
        nodeType: node.nodeType,
        nodeName: node.nodeName
    };
    if (node.nodeValue != null) {
        description.nodeValue = node.nodeValue;
    }
    if ('attributes' in node) {
        var element = node;
        var elementDescription = description;
        elementDescription.attributes = describeElementAttributes(element);
    }
    var childDescriptions = describeNodeList(node.childNodes);
    if (childDescriptions.length > 0) {
        description.childNodes = childDescriptions;
    }
    return description;
}
exports.describeNode = describeNode;
/**
 * Converts a DOM NodeList to json friendly summary.
 * @function
 * @param {NodeList} list - nodes to be converted
 * @returns {DOMNodeDescription[]} resulting summary
 */
function describeNodeList(list) {
    var descriptions = [];
    list.forEach(function (child) {
        var childDescription = describeNode(child);
        descriptions.push(childDescription);
    });
    return descriptions;
}
exports.describeNodeList = describeNodeList;
/**
 * Converts a DOM Element's attributes to json friendly key-value map.
 * @function
 * @param {Element} element - element to be evaluated
 * @returns {Record<string, string>} resulting key-value map
 */
function describeElementAttributes(element) {
    var attributeMap = {};
    for (var index = 0; index < element.attributes.length; index++) {
        var attribute = element.attributes.item(index);
        if (attribute != null) {
            attributeMap[attribute.localName] = attribute.value;
        }
    }
    return attributeMap;
}
exports.describeElementAttributes = describeElementAttributes;
/**
 * Tries to create a DOM Node from a json friendly description.
 * @function
 * @param {DOMNodeDescription} description - defining properties of the node
 * @returns {Node | undefined} resulting node
 */
function createDescribedNode(description) {
    var _a, _b, _c, _d;
    switch (description.nodeType) {
        case NodeType.TEXT_NODE: {
            var text = (_a = description.nodeValue) !== null && _a !== void 0 ? _a : '';
            return document.createTextNode(text);
        }
        case NodeType.ELEMENT_NODE: {
            if (description.nodeName != null) {
                var element = document.createElement(description.nodeName);
                var elementDescription = description;
                if (elementDescription.attributes != null) {
                    setElementAttributes(element, elementDescription.attributes);
                }
                appendDescribedChildNodes(element, description);
                return element;
            }
            break;
        }
        case NodeType.ATTRIBUTE_NODE: {
            if (description.nodeName != null) {
                var attribute = document.createAttribute(description.nodeName);
                if (description.nodeValue != null) {
                    attribute.value = description.nodeValue;
                }
                return attribute;
            }
            break;
        }
        case NodeType.CDATA_SECTION_NODE: {
            var data = (_b = description.nodeValue) !== null && _b !== void 0 ? _b : '';
            return document.createCDATASection(data);
        }
        case NodeType.COMMENT_NODE: {
            var data = (_c = description.nodeValue) !== null && _c !== void 0 ? _c : '';
            return document.createComment(data);
        }
        case NodeType.PROCESSING_INSTRUCTION_NODE: {
            if (description.nodeName != null) {
                var data = (_d = description.nodeValue) !== null && _d !== void 0 ? _d : '';
                return document.createProcessingInstruction(description.nodeName, data);
            }
            break;
        }
        case NodeType.DOCUMENT_FRAGMENT_NODE: {
            return document.createDocumentFragment();
        }
    }
}
exports.createDescribedNode = createDescribedNode;
/**
 * Adds children to a DOM node based on that node's description.
 * @function
 * @param {Node} target - node the children should be added to
 * @param {DOMNodeDescription} description - defining properties of the node
 */
function appendDescribedChildNodes(target, description) {
    if (description.childNodes != null) {
        for (var _i = 0, _a = description.childNodes; _i < _a.length; _i++) {
            var childDescription = _a[_i];
            var child = createDescribedNode(childDescription);
            if (child != null) {
                target.appendChild(child);
            }
        }
    }
}
exports.appendDescribedChildNodes = appendDescribedChildNodes;
/**
 * Sets the attributes of a DOM element from a value map.
 * @function
 * @param {Element} element - element to be modified
 * @param {Record<string, string>} values - map of attribute values, keyed by that attribute's name
 */
function setElementAttributes(element, values) {
    for (var key in values) {
        var value = values[key];
        element.setAttribute(key, value);
    }
}
exports.setElementAttributes = setElementAttributes;
/**
 * These covers the nodeName values all DOM Node types with a fixed nodeName vs
 * those where that property is node specific.
 * @readonly
 * @enum {string}
 */
var FixedNodeTypeNames;
(function (FixedNodeTypeNames) {
    FixedNodeTypeNames["TEXT_NODE"] = "#text";
    FixedNodeTypeNames["CDATA_SECTION_NODE"] = "#cdata-section";
    FixedNodeTypeNames["COMMENT_NODE"] = "#comment";
    FixedNodeTypeNames["DOCUMENT_NODE"] = "#document";
    FixedNodeTypeNames["DOCUMENT_FRAGMENT_NODE"] = "#document-fragment";
})(FixedNodeTypeNames || (exports.FixedNodeTypeNames = FixedNodeTypeNames = {}));
/**
 * Creates a DOM Element description from a set of defining parameters.
 * @function
 * @param {string} tag - node name of the target element
 * @param {Record<string, string> | undefined} attributes - key-value map of the element's attributes
 * @param {DOMNodeDescription[] | undefined} childNodes - desciption of the target element's children
 * @returns {DOMNodeDescription} resulting description
 */
function createElementDescription(tag, attributes, childNodes) {
    var description = {
        nodeType: NodeType.ELEMENT_NODE,
        nodeName: tag
    };
    if (attributes != null) {
        description.attributes = __assign({}, attributes);
    }
    if (childNodes != null) {
        description.childNodes = childNodes;
    }
    return description;
}
exports.createElementDescription = createElementDescription;
/**
 * Creates a DOM Attribute node description from a set of defining parameters.
 * @function
 * @param {string} name - name of the target attribute
 * @param {string | null} value - attribute's assigne value
 * @returns {DOMNodeDescription} resulting description
 */
function createAttributeDescription(name, value) {
    return {
        nodeType: NodeType.ATTRIBUTE_NODE,
        nodeName: name,
        nodeValue: value
    };
}
exports.createAttributeDescription = createAttributeDescription;
/**
 * Creates a DOM Text node's description from the provided text.
 * @function
 * @param {string} text - text to be converted to a node
 * @returns {DOMNodeDescription} resulting description
 */
function createTextNodeDescription(text) {
    return {
        nodeType: NodeType.TEXT_NODE,
        nodeName: FixedNodeTypeNames.TEXT_NODE,
        nodeValue: text
    };
}
exports.createTextNodeDescription = createTextNodeDescription;
/**
 * Creates a DOM Comment node's description from the provided text.
 * @function
 * @param {string} text - text to be converted to a node
 * @returns {DOMNodeDescription} resulting description
 */
function createCommentDescription(text) {
    return {
        nodeType: NodeType.COMMENT_NODE,
        nodeName: FixedNodeTypeNames.COMMENT_NODE,
        nodeValue: text
    };
}
exports.createCommentDescription = createCommentDescription;
/**
 * Creates a DOM CDATASection node's description from the provided text.
 * @function
 * @param {string} data - text to be converted to a node
 * @returns {DOMNodeDescription} resulting description
 */
function createCDataDescription(data) {
    return {
        nodeType: NodeType.CDATA_SECTION_NODE,
        nodeName: FixedNodeTypeNames.CDATA_SECTION_NODE,
        nodeValue: data
    };
}
exports.createCDataDescription = createCDataDescription;
/**
 * Creates a DOM Processing Instruction node's description from the provided text.
 * @function
 * @param {string} target - app the data is assocated with
 * @param {string} data - text to be passed on to the target
 * @returns {DOMNodeDescription} resulting description
 */
function createProcessingInstructionDescription(target, data) {
    return {
        nodeType: NodeType.PROCESSING_INSTRUCTION_NODE,
        nodeName: target,
        nodeValue: data
    };
}
exports.createProcessingInstructionDescription = createProcessingInstructionDescription;
/**
 * Creates a Dom Document Fragment description with the associated children.
 * @function
 * @param {DOMNodeDescription[] | undefined} childNodes - desciption of the target fragment's children
 * @returns {DOMNodeDescription} resulting description
 */
function createFragmentDescription(childNodes) {
    var description = {
        nodeType: NodeType.DOCUMENT_FRAGMENT_NODE,
        nodeName: FixedNodeTypeNames.DOCUMENT_FRAGMENT_NODE
    };
    if (childNodes != null) {
        description.childNodes = childNodes;
    }
    return description;
}
exports.createFragmentDescription = createFragmentDescription;
