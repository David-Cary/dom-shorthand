/**
 * These are the possible nodeType values for a DOM Node packed in an enum.
 * @readonly
 * @enum {number}
 */
export enum NodeType {
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
  nodeType: NodeType
  nodeName?: string
  nodeValue?: string | null
  childNodes?: DOMNodeDescription[]
}

/**
 * This covers the additional properties a element node may have.
 * @interface
 * @property {Record<string, string> | undefined} attributes - key-value map for the element's attributes
 */
export interface DOMElementDescription extends DOMNodeDescription {
  attributes?: Record<string, string>
}

/**
 * Converts a DOM Node to json friendly summary.
 * @function
 * @param {Node} node - node to be converted
 * @returns {DOMNodeDescription} resulting summary
 */
export function describeNode (node: Node): DOMNodeDescription {
  const description: DOMNodeDescription = {
    nodeType: node.nodeType,
    nodeName: node.nodeName
  }
  if (node.nodeValue != null) {
    description.nodeValue = node.nodeValue
  }
  if ('attributes' in node) {
    const element = node as Element
    const elementDescription = description as DOMElementDescription
    elementDescription.attributes = describeElementAttributes(element)
  }
  const childDescriptions = describeNodeList(node.childNodes)
  if (childDescriptions.length > 0) {
    description.childNodes = childDescriptions
  }
  return description
}

/**
 * Converts a DOM NodeList to json friendly summary.
 * @function
 * @param {NodeList} list - nodes to be converted
 * @returns {DOMNodeDescription[]} resulting summary
 */
export function describeNodeList (list: NodeList): DOMNodeDescription[] {
  const descriptions: DOMNodeDescription[] = []
  list.forEach((child) => {
    const childDescription = describeNode(child)
    descriptions.push(childDescription)
  })
  return descriptions
}

/**
 * Converts a DOM Element's attributes to json friendly key-value map.
 * @function
 * @param {Element} element - element to be evaluated
 * @returns {Record<string, string>} resulting key-value map
 */
export function describeElementAttributes (element: Element): Record<string, string> {
  const attributeMap: Record<string, string> = {}
  for (let index = 0; index < element.attributes.length; index++) {
    const attribute = element.attributes.item(index)
    if (attribute != null) {
      attributeMap[attribute.localName] = attribute.value
    }
  }
  return attributeMap
}

/**
 * Tries to create a DOM Node from a json friendly description.
 * @function
 * @param {DOMNodeDescription} description - defining properties of the node
 * @returns {Node | undefined} resulting node
 */
export function createDescribedNode (description: DOMNodeDescription): Node | undefined {
  switch (description.nodeType) {
    case NodeType.TEXT_NODE: {
      const text = description.nodeValue ?? ''
      return document.createTextNode(text)
    }
    case NodeType.ELEMENT_NODE: {
      if (description.nodeName != null) {
        const element = document.createElement(description.nodeName)
        const elementDescription = description as DOMElementDescription
        if (elementDescription.attributes != null) {
          setElementAttributes(element, elementDescription.attributes)
        }
        appendDescribedChildNodes(element, description)
        return element
      }
      break
    }
    case NodeType.ATTRIBUTE_NODE: {
      if (description.nodeName != null) {
        const attribute = document.createAttribute(description.nodeName)
        if (description.nodeValue != null) {
          attribute.value = description.nodeValue
        }
        return attribute
      }
      break
    }
    case NodeType.CDATA_SECTION_NODE: {
      const data = description.nodeValue ?? ''
      return document.createCDATASection(data)
    }
    case NodeType.COMMENT_NODE: {
      const data = description.nodeValue ?? ''
      return document.createComment(data)
    }
    case NodeType.PROCESSING_INSTRUCTION_NODE: {
      if (description.nodeName != null) {
        const data = description.nodeValue ?? ''
        return document.createProcessingInstruction(description.nodeName, data)
      }
      break
    }
    case NodeType.DOCUMENT_FRAGMENT_NODE: {
      return document.createDocumentFragment()
    }
  }
}

/**
 * Adds children to a DOM node based on that node's description.
 * @function
 * @param {Node} target - node the children should be added to
 * @param {DOMNodeDescription} description - defining properties of the node
 */
export function appendDescribedChildNodes (
  target: Node,
  description: DOMNodeDescription
): void {
  if (description.childNodes != null) {
    for (const childDescription of description.childNodes) {
      const child = createDescribedNode(childDescription)
      if (child != null) {
        target.appendChild(child)
      }
    }
  }
}

/**
 * Sets the attributes of a DOM element from a value map.
 * @function
 * @param {Element} element - element to be modified
 * @param {Record<string, string>} values - map of attribute values, keyed by that attribute's name
 */
export function setElementAttributes (
  element: Element,
  values: Record<string, string>
): void {
  for (const key in values) {
    const value = values[key]
    element.setAttribute(key, value)
  }
}

/**
 * These covers the nodeName values all DOM Node types with a fixed nodeName vs
 * those where that property is node specific.
 * @readonly
 * @enum {string}
 */
export enum FixedNodeTypeNames {
  TEXT_NODE = '#text',
  CDATA_SECTION_NODE = '#cdata-section',
  COMMENT_NODE = '#comment',
  DOCUMENT_NODE = '#document',
  DOCUMENT_FRAGMENT_NODE = '#document-fragment'
}

/**
 * Creates a DOM Element description from a set of defining parameters.
 * @function
 * @param {string} tag - node name of the target element
 * @param {Record<string, string> | undefined} attributes - key-value map of the element's attributes
 * @param {DOMNodeDescription[] | undefined} childNodes - desciption of the target element's children
 * @returns {DOMNodeDescription} resulting description
 */
export function createElementDescription (
  tag: string,
  attributes?: Record<string, string>,
  childNodes?: DOMNodeDescription[]
): DOMNodeDescription {
  const description: DOMElementDescription = {
    nodeType: NodeType.ELEMENT_NODE,
    nodeName: tag
  }
  if (attributes != null) {
    description.attributes = { ...attributes }
  }
  if (childNodes != null) {
    description.childNodes = childNodes
  }
  return description
}

/**
 * Creates a DOM Attribute node description from a set of defining parameters.
 * @function
 * @param {string} name - name of the target attribute
 * @param {string | null} value - attribute's assigne value
 * @returns {DOMNodeDescription} resulting description
 */
export function createAttributeDescription (
  name: string,
  value: string | null
): DOMNodeDescription {
  return {
    nodeType: NodeType.ATTRIBUTE_NODE,
    nodeName: name,
    nodeValue: value
  }
}

/**
 * Creates a DOM Text node's description from the provided text.
 * @function
 * @param {string} text - text to be converted to a node
 * @returns {DOMNodeDescription} resulting description
 */
export function createTextNodeDescription (text: string): DOMNodeDescription {
  return {
    nodeType: NodeType.TEXT_NODE,
    nodeName: FixedNodeTypeNames.TEXT_NODE,
    nodeValue: text
  }
}

/**
 * Creates a DOM Comment node's description from the provided text.
 * @function
 * @param {string} text - text to be converted to a node
 * @returns {DOMNodeDescription} resulting description
 */
export function createCommentDescription (text: string): DOMNodeDescription {
  return {
    nodeType: NodeType.COMMENT_NODE,
    nodeName: FixedNodeTypeNames.COMMENT_NODE,
    nodeValue: text
  }
}

/**
 * Creates a DOM CDATASection node's description from the provided text.
 * @function
 * @param {string} data - text to be converted to a node
 * @returns {DOMNodeDescription} resulting description
 */
export function createCDataDescription (data: string): DOMNodeDescription {
  return {
    nodeType: NodeType.CDATA_SECTION_NODE,
    nodeName: FixedNodeTypeNames.CDATA_SECTION_NODE,
    nodeValue: data
  }
}

/**
 * Creates a DOM Processing Instruction node's description from the provided text.
 * @function
 * @param {string} target - app the data is assocated with
 * @param {string} data - text to be passed on to the target
 * @returns {DOMNodeDescription} resulting description
 */
export function createProcessingInstructionDescription (
  target: string,
  data: string
): DOMNodeDescription {
  return {
    nodeType: NodeType.PROCESSING_INSTRUCTION_NODE,
    nodeName: target,
    nodeValue: data
  }
}

/**
 * Creates a Dom Document Fragment description with the associated children.
 * @function
 * @param {DOMNodeDescription[] | undefined} childNodes - desciption of the target fragment's children
 * @returns {DOMNodeDescription} resulting description
 */
export function createFragmentDescription (
  childNodes?: DOMNodeDescription[]
): DOMNodeDescription {
  const description: DOMElementDescription = {
    nodeType: NodeType.DOCUMENT_FRAGMENT_NODE,
    nodeName: FixedNodeTypeNames.DOCUMENT_FRAGMENT_NODE
  }
  if (childNodes != null) {
    description.childNodes = childNodes
  }
  return description
}
