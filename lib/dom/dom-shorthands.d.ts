import { type DOMNodeDescription, type DOMElementDescription } from './dom-nodes';
/**
 * A more compact json friendly way of describing a DOM Element.
 * @interface
 * @property {string} tag - element type / node name for the target element
 * @property {Record<string, string> | undefined} attributes - key-value map for the element's attributes
 * @property {DOMNodeShorthand[] | undefined} content - shorthands for the element's child nodes
 */
export interface DOMElementShorthand {
    tag: string;
    attributes?: Record<string, string>;
    content?: DOMNodeShorthand[];
}
/**
 * A more compact json friendly way of describing a DOM Attribute node.
 * @interface
 * @property {string} name - attribute name / key
 * @property {string | null} value - attribute's associated value
 */
export interface DOMAttributeShorthand {
    name: string;
    value: string | null;
}
/**
 * A more compact json friendly way of describing a DOM CDATASection.
 * @interface
 * @property {string} cData - character data for the target section
 */
export interface DOMCDataShorthand {
    cData: string;
}
/**
 * A more compact json friendly way of describing a DOM Processing Instruction node.
 * @interface
 * @property {string} target - app the data is assocated with
 * @property {string} data - text to be passed on to the target
 */
export interface DOMProcessingInstructionShorthand {
    target: string;
    data: string;
}
/**
 * A more compact json friendly way of describing a DOM Comment node.
 * @interface
 * @property {string} comment - comment node's text
 */
export interface DOMCommentShorthand {
    comment: string;
}
/**
 * A more compact json friendly way of describing a DOM Document Fragment.
 * @interface
 * @property {DOMNodeShorthand[] | undefined} content - shorthands for the fragment's child nodes
 */
export interface DOMFragmentShorthand {
    content?: DOMNodeShorthand[];
}
export type DOMNodeShorthand = (DOMElementShorthand | DOMAttributeShorthand | string | DOMCDataShorthand | DOMProcessingInstructionShorthand | DOMCommentShorthand | DOMFragmentShorthand);
/**
 * Converts a more detailed DOM Node description to a shorter, more type-specific form.
 * @function
 * @param {DOMNodeDescription | DOMElementDescription} desciption - json friendly description of the target node
 * @returns {DOMNodeShorthand | undefined} resulting short form description of the node
 */
export declare function DOMDescriptionToShorthand(description: DOMNodeDescription | DOMElementDescription): DOMNodeShorthand | undefined;
/**
 * Copies child node descriptions from the parent node description to it's shorthand.
 * @function
 * @param {DOMNodeDescription} desciption - parent node's description
 * @param {DOMElementShorthand | DOMFragmentShorthand} shorthand - location the children should be copied to
 */
export declare function addChildNodesToShorthand(description: DOMNodeDescription, shorthand: DOMElementShorthand | DOMFragmentShorthand): void;
/**
 * Converts an abbreviated DOM Node description back into it's more detailed and less type specific form.
 * @function
 * @param {DOMNodeShorthand} shorthand - abbreviated description to be converted
 * @returns {DOMNodeShorthand} resulting expanded node description
 */
export declare function shorthandToDOMDescription(shorthand: DOMNodeShorthand): DOMNodeDescription;
/**
 * Converts an abbreviated DOM Node description to HTML text.
 * @function
 * @param {DOMNodeShorthand} shorthand - abbreviated description to be converted
 * @returns {string} resulting html
 */
export declare function shorthandToHTML(shorthand: DOMNodeShorthand): string;
/**
 * Tries to retrieve and convert the contents of a DOM Node shorthand to their expanded forms.
 * @function
 * @param {DOMElementShorthand | DOMFragmentShorthand} desciption - node shorthand that can have contents
 * @returns {DOMNodeDescription[] | undefined} resulting child node descriptions
 */
export declare function getShorthandContentDescription(shorthand: DOMElementShorthand | DOMFragmentShorthand): DOMNodeDescription[] | undefined;
/**
 * Tries to cast the provided data to an appropriate DOM Node shorthand.
 * @function
 * @param {unknown} target - data to be recast
 * @returns {DOMNodeShorthand | undefined} provided target if valid or undefined if invalid
 */
export declare function validateDOMShorthand(target: unknown): DOMNodeShorthand | undefined;
