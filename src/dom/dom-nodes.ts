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
  childNodes?: DOMElementDescription[]
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
    if (element.getAttribute(key) !== value) {
      element.setAttribute(key, value)
    }
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

/**
 * Checks if am attribute map matches the provided description.
 * @function
 * @param {NamedNodeMap} attributes - attributes to be evaluated
 * @param {Record<string, string>} description - required values
 * @returns {boolean}
 */
export function attributesMatchDescription (
  attributes: NamedNodeMap,
  description: Record<string, string>
): boolean {
  let count = 0
  for (const key in description) {
    const attribute = attributes.getNamedItem(key)
    if (attribute != null && description[key] === attribute.value) {
      count++
    } else return false
  }
  return attributes.length === count
}

/**
 * Checks if a node's properties and children match the provided description.
 * @function
 * @param {Node} node - node to be evaluated
 * @param {DOMElementDescription} description - required values
 * @returns {boolean}
 */
export function nodeMatchesDescription (
  node: Node,
  description: DOMElementDescription
): boolean {
  if (node.nodeType !== description.nodeType) return false
  if (
    description.nodeName != null &&
    node.nodeName !== description.nodeName
  ) return false
  if (
    description.nodeValue != null &&
    node.nodeValue !== description.nodeValue
  ) return false
  if (node instanceof Element) {
    const describedAttributes = description.attributes ?? {}
    const attributesMatch = attributesMatchDescription(node.attributes, describedAttributes)
    if (!attributesMatch) return false
  } else if (description.attributes != null) return false
  const describedChildren = description.childNodes ?? []
  const childrenMatch = nodeListMatchesDescription(node.childNodes, describedChildren)
  return childrenMatch
}

/**
 * Checks if a node list's contents match the provided description.
 * @function
 * @param {Node} node - nodes to be evaluated
 * @param {DOMElementDescription[]} description - required values
 * @returns {boolean}
 */
export function nodeListMatchesDescription (
  nodes: NodeList,
  descriptions: DOMElementDescription[]
): boolean {
  for (let i = 0; i < descriptions.length; i++) {
    const node = nodes.item(i)
    if (node != null) {
      const matched = nodeMatchesDescription(node, descriptions[i])
      if (matched) continue
    }
    return false
  }
  return nodes.length === descriptions.length
}

/**
 * Checks if two values have matching properties.
 * @function
 * @param {any} first - first value to be evaluated
 * @param {any} second - second value to be evaluated
 * @returns {boolean}
 */
export function checkEquivalence (
  first: any,
  second: any
): boolean {
  if (typeof first === 'object' && first != null) {
    if (typeof second === 'object' && second != null) {
      if (Array.isArray(first)) {
        if (Array.isArray(second)) {
          for (let i = 0; i < first.length; i++) {
            const matched = checkEquivalence(first[i], second[i])
            if (!matched) return false
          }
          return first.length === second.length
        }
        return false
      }
      for (const key in first) {
        const matched = checkEquivalence(first[key], second[key])
        if (!matched) return false
      }
      for (const key in second) {
        if (key in first) continue
        return false
      }
      return true
    }
    return false
  }
  return first === second
}

/**
 * Sets the child nodes of the target node to match the provided descriptions.
 * @function
 * @param {NamedNodeMap} attributes - attributes to be modified
 * @param {Record<string, string>} description - required values
 */
export function applyDescribedAttributeChanges (
  attributes: NamedNodeMap,
  description: Record<string, string>
): void {
  for (const key in description) {
    const attribute = attributes.getNamedItem(key)
    const value = description[key]
    if (attribute == null) {
      const newAttribute = document.createAttribute(key)
      newAttribute.value = value
      attributes.setNamedItem(newAttribute)
    } else if (attribute.value !== value) {
      attribute.value = value
    }
  }
  for (let i = 0; i < attributes.length; i++) {
    const attribute = attributes.item(i)
    if (attribute == null || attribute.name in description) continue
    attributes.removeNamedItem(attribute.name)
  }
}

/**
 * Sets the node's properties and children based on the provided description.
 * @function
 * @param {Node} node - node to be modified
 * @param {DOMNodeDescription[] | undefined} description - covers the desired state of the node
 * @returns {Node | undefined} if a new node had to created, that will be returned
 */
export function applyDescribedNodeChanges (
  node: Node,
  description: DOMElementDescription
): Node | undefined {
  if (node.nodeName === description.nodeName) {
    if (node instanceof CharacterData) {
      const data = description.nodeValue
      if (data != null && node.data !== data) {
        node.data = data
      }
    }
    if (node instanceof Element) {
      const attributes = description.attributes ?? {}
      applyDescribedAttributeChanges(node.attributes, attributes)
    }
    if (description.childNodes != null) {
      setChildNodesFromDescriptions(node, description.childNodes)
    }
    return node
  }
  const replacement = createDescribedNode(description)
  return replacement
}

/**
 * Sets the child nodes of the target node to match the provided descriptions.
 * @function
 * @param {Node} node - node whose children are to be modified
 * @param {DOMNodeDescription[]} descriptions - covers the desired state of the node's children
 */
export function setChildNodesFromDescriptions (
  node: Node,
  descriptions: DOMElementDescription[]
): void {
  while (node.childNodes.length > descriptions.length) {
    const child = node.lastChild
    if (child != null) node.removeChild(child)
    else break
  }
  for (let i = 0; i < descriptions.length; i++) {
    const description = descriptions[i]
    const child = node.childNodes.item(i)
    if (child != null) {
      const updatedChild = applyDescribedNodeChanges(child, description)
      if (updatedChild != null && child !== updatedChild) {
        node.replaceChild(updatedChild, child)
      }
    } else {
      const newChild = createDescribedNode(description)
      if (newChild != null) node.appendChild(newChild)
    }
  }
}
