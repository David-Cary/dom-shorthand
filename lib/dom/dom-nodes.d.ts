/**
 * These are the possible nodeType values for a DOM Node packed in an enum.
 * @readonly
 * @enum {number}
 */
export declare enum NodeType {
    ELEMENT_NODE = 1,
    ATTRIBUTE_NODE = 2,
    TEXT_NODE = 3,
    CDATA_SECTION_NODE = 4,
    PROCESSING_INSTRUCTION_NODE = 7,
    COMMENT_NODE = 8,
    DOCUMENT_NODE = 9,
    DOCUMENT_TYPE_NODE = 10,
    DOCUMENT_FRAGMENT_NODE = 11
}
/**
 * This covers the minimal set of properties needed to describe a DOM Node
 * as a JSON or javascript object.
 * @interface
 * @property {NodeType} nodeType - node type code
 * @property {string | undefined} nodeName - name string for the node, can be node specific or fixed based on type
 * @property {string | null | undefined} nodeValue - value associated with the node
 * @property {DOMNodeDescription | undefined} childNodes - children of the node
 */
export interface DOMNodeDescription {
    nodeType: NodeType;
    nodeName?: string;
    nodeValue?: string | null;
    childNodes?: DOMNodeDescription[];
}
/**
 * This covers the additional properties a element node may have.
 * @interface
 * @property {Record<string, string> | undefined} attributes - key-value map for the element's attributes
 */
export interface DOMElementDescription extends DOMNodeDescription {
    attributes?: Record<string, string>;
}
/**
 * Converts a DOM Node to json friendly summary.
 * @function
 * @param {Node} node - node to be converted
 * @returns {DOMNodeDescription} resulting summary
 */
export declare function describeNode(node: Node): DOMNodeDescription;
/**
 * Converts a DOM NodeList to json friendly summary.
 * @function
 * @param {NodeList} list - nodes to be converted
 * @returns {DOMNodeDescription[]} resulting summary
 */
export declare function describeNodeList(list: NodeList): DOMNodeDescription[];
/**
 * Converts a DOM Element's attributes to json friendly key-value map.
 * @function
 * @param {Element} element - element to be evaluated
 * @returns {Record<string, string>} resulting key-value map
 */
export declare function describeElementAttributes(element: Element): Record<string, string>;
/**
 * Tries to create a DOM Node from a json friendly description.
 * @function
 * @param {DOMNodeDescription} description - defining properties of the node
 * @returns {Node | undefined} resulting node
 */
export declare function createDescribedNode(description: DOMNodeDescription): Node | undefined;
/**
 * Adds children to a DOM node based on that node's description.
 * @function
 * @param {Node} target - node the children should be added to
 * @param {DOMNodeDescription} description - defining properties of the node
 */
export declare function appendDescribedChildNodes(target: Node, description: DOMNodeDescription): void;
/**
 * Sets the attributes of a DOM element from a value map.
 * @function
 * @param {Element} element - element to be modified
 * @param {Record<string, string>} values - map of attribute values, keyed by that attribute's name
 */
export declare function setElementAttributes(element: Element, values: Record<string, string>): void;
/**
 * These covers the nodeName values all DOM Node types with a fixed nodeName vs
 * those where that property is node specific.
 * @readonly
 * @enum {string}
 */
export declare enum FixedNodeTypeNames {
    TEXT_NODE = "#text",
    CDATA_SECTION_NODE = "#cdata-section",
    COMMENT_NODE = "#comment",
    DOCUMENT_NODE = "#document",
    DOCUMENT_FRAGMENT_NODE = "#document-fragment"
}
/**
 * Creates a DOM Element description from a set of defining parameters.
 * @function
 * @param {string} tag - node name of the target element
 * @param {Record<string, string> | undefined} attributes - key-value map of the element's attributes
 * @param {DOMNodeDescription[] | undefined} childNodes - desciption of the target element's children
 * @returns {DOMNodeDescription} resulting description
 */
export declare function createElementDescription(tag: string, attributes?: Record<string, string>, childNodes?: DOMNodeDescription[]): DOMNodeDescription;
/**
 * Creates a DOM Attribute node description from a set of defining parameters.
 * @function
 * @param {string} name - name of the target attribute
 * @param {string | null} value - attribute's assigne value
 * @returns {DOMNodeDescription} resulting description
 */
export declare function createAttributeDescription(name: string, value: string | null): DOMNodeDescription;
/**
 * Creates a DOM Text node's description from the provided text.
 * @function
 * @param {string} text - text to be converted to a node
 * @returns {DOMNodeDescription} resulting description
 */
export declare function createTextNodeDescription(text: string): DOMNodeDescription;
/**
 * Creates a DOM Comment node's description from the provided text.
 * @function
 * @param {string} text - text to be converted to a node
 * @returns {DOMNodeDescription} resulting description
 */
export declare function createCommentDescription(text: string): DOMNodeDescription;
/**
 * Creates a DOM CDATASection node's description from the provided text.
 * @function
 * @param {string} data - text to be converted to a node
 * @returns {DOMNodeDescription} resulting description
 */
export declare function createCDataDescription(data: string): DOMNodeDescription;
/**
 * Creates a DOM Processing Instruction node's description from the provided text.
 * @function
 * @param {string} target - app the data is assocated with
 * @param {string} data - text to be passed on to the target
 * @returns {DOMNodeDescription} resulting description
 */
export declare function createProcessingInstructionDescription(target: string, data: string): DOMNodeDescription;
/**
 * Creates a Dom Document Fragment description with the associated children.
 * @function
 * @param {DOMNodeDescription[] | undefined} childNodes - desciption of the target fragment's children
 * @returns {DOMNodeDescription} resulting description
 */
export declare function createFragmentDescription(childNodes?: DOMNodeDescription[]): DOMNodeDescription;
/**
 * Sets the child nodes of the target node to match the provided descriptions.
 * @function
 * @param {Node} node - node whose children are to be modified
 * @param {DOMNodeDescription[] | undefined} descriptions - covers the desired state of the node's children
 */
export declare function setChildNodesFromDescriptions(node: Node, descriptions: DOMElementDescription[]): void;
