import {
  NodeType,
  type DOMNodeDescription,
  type DOMElementDescription,
  createElementDescription,
  createAttributeDescription,
  createTextNodeDescription,
  createCDataDescription,
  createProcessingInstructionDescription,
  createCommentDescription,
  createFragmentDescription,
  describeNode,
  describeNodeList,
  applyDescribedNodeChanges,
  setChildNodesFromDescriptions
} from './dom-nodes'

/**
 * A more compact json friendly way of describing a DOM Element.
 * @interface
 * @property {string} tag - element type / node name for the target element
 * @property {Record<string, string> | undefined} attributes - key-value map for the element's attributes
 * @property {DOMNodeShorthand[] | undefined} content - shorthands for the element's child nodes
 */
export interface DOMElementShorthand {
  tag: string
  attributes?: Record<string, string>
  content?: DOMNodeShorthand[]
}

/**
 * A more compact json friendly way of describing a DOM Attribute node.
 * @interface
 * @property {string} name - attribute name / key
 * @property {string | null} value - attribute's associated value
 */
export interface DOMAttributeShorthand {
  name: string
  value: string | null
}

/**
 * A more compact json friendly way of describing a DOM CDATASection.
 * @interface
 * @property {string} cData - character data for the target section
 */
export interface DOMCDataShorthand {
  cData: string
}

/**
 * A more compact json friendly way of describing a DOM Processing Instruction node.
 * @interface
 * @property {string} target - app the data is assocated with
 * @property {string} data - text to be passed on to the target
 */
export interface DOMProcessingInstructionShorthand {
  target: string
  data: string
}

/**
 * A more compact json friendly way of describing a DOM Comment node.
 * @interface
 * @property {string} comment - comment node's text
 */
export interface DOMCommentShorthand {
  comment: string
}

/**
 * A more compact json friendly way of describing a DOM Document Fragment.
 * @interface
 * @property {DOMNodeShorthand[] | undefined} content - shorthands for the fragment's child nodes
 */
export interface DOMFragmentShorthand {
  content?: DOMNodeShorthand[]
}

export type DOMNodeShorthand = (
  DOMElementShorthand |
  DOMAttributeShorthand |
  string |
  DOMCDataShorthand |
  DOMProcessingInstructionShorthand |
  DOMCommentShorthand |
  DOMFragmentShorthand
)

/**
 * Converts a more detailed DOM Node description to a shorter, more type-specific form.
 * @function
 * @param {DOMNodeDescription | DOMElementDescription} desciption - json friendly description of the target node
 * @returns {DOMNodeShorthand | undefined} resulting short form description of the node
 */
export function DOMDescriptionToShorthand (
  description: DOMNodeDescription | DOMElementDescription
): DOMNodeShorthand | undefined {
  switch (description.nodeType) {
    case NodeType.TEXT_NODE: {
      return description.nodeValue ?? ''
    }
    case NodeType.ELEMENT_NODE: {
      const shorthand: DOMElementShorthand = {
        tag: description.nodeName ?? ''
      }
      if ('attributes' in description && description.attributes != null) {
        // Only create an attribute object if it's not empty.
        if (Object.keys(description.attributes).length > 0) {
          shorthand.attributes = { ...description.attributes }
        }
      }
      addChildNodesToShorthand(description, shorthand)
      return shorthand
    }
    case NodeType.ATTRIBUTE_NODE: {
      return {
        name: description.nodeName ?? '',
        value: description.nodeValue ?? null
      }
    }
    case NodeType.CDATA_SECTION_NODE: {
      return {
        cData: description.nodeValue ?? ''
      }
    }
    case NodeType.COMMENT_NODE: {
      return {
        comment: description.nodeValue ?? ''
      }
    }
    case NodeType.PROCESSING_INSTRUCTION_NODE: {
      return {
        target: description.nodeName ?? '',
        data: description.nodeValue ?? ''
      }
    }
    case NodeType.DOCUMENT_FRAGMENT_NODE: {
      const shorthand: DOMFragmentShorthand = {}
      addChildNodesToShorthand(description, shorthand)
      return shorthand
    }
  }
}

/**
 * Copies child node descriptions from the parent node description to it's shorthand.
 * @function
 * @param {DOMNodeDescription} desciption - parent node's description
 * @param {DOMElementShorthand | DOMFragmentShorthand} shorthand - location the children should be copied to
 */
export function addChildNodesToShorthand (
  description: DOMNodeDescription,
  shorthand: DOMElementShorthand | DOMFragmentShorthand
): void {
  if (description.childNodes != null) {
    shorthand.content = []
    for (const childDescription of description.childNodes) {
      const childShorthand = DOMDescriptionToShorthand(childDescription)
      if (childShorthand != null) {
        shorthand.content.push(childShorthand)
      }
    }
  }
}

/**
 * Converts an abbreviated DOM Node description back into it's more detailed and less type specific form.
 * @function
 * @param {DOMNodeShorthand} shorthand - abbreviated description to be converted
 * @returns {DOMNodeShorthand} resulting expanded node description
 */
export function shorthandToDOMDescription (
  shorthand: DOMNodeShorthand
): DOMNodeDescription {
  if (typeof shorthand === 'string') {
    return createTextNodeDescription(shorthand)
  }
  if ('tag' in shorthand) {
    const childNodes = getShorthandContentDescription(shorthand)
    return createElementDescription(shorthand.tag, shorthand.attributes, childNodes)
  }
  if ('name' in shorthand && 'value' in shorthand) {
    return createAttributeDescription(shorthand.name, shorthand.value)
  }
  if ('cData' in shorthand) {
    return createCDataDescription(shorthand.cData)
  }
  if ('target' in shorthand && 'data' in shorthand) {
    return createProcessingInstructionDescription(shorthand.target, shorthand.data)
  }
  if ('comment' in shorthand) {
    return createCommentDescription(shorthand.comment)
  }
  const childNodes = getShorthandContentDescription(shorthand)
  return createFragmentDescription(childNodes)
}

/**
 * Converts an abbreviated DOM Node description to HTML text.
 * @function
 * @param {DOMNodeShorthand} shorthand - abbreviated description to be converted
 * @returns {string} resulting html
 */
export function shorthandToHTML (
  shorthand: DOMNodeShorthand
): string {
  if (typeof shorthand === 'string') {
    return shorthand
  }
  if ('tag' in shorthand) {
    let html = `<${shorthand.tag}`
    if ('attributes' in shorthand) {
      for (const key in shorthand.attributes) {
        const value = shorthand.attributes[key]
        html += ` ${key}="${value}"`
      }
    }
    if ('content' in shorthand && shorthand.content != null) {
      html += '>'
      for (const item of shorthand.content) {
        html += shorthandToHTML(item)
      }
      html += `</${shorthand.tag}>`
    } else {
      html += '/>'
    }
    return html
  }
  if ('content' in shorthand && shorthand.content != null) {
    let html = ''
    for (const item of shorthand.content) {
      html += shorthandToHTML(item)
    }
    return html
  }
  if ('comment' in shorthand) {
    return `<!--${shorthand.comment}-->`
  }
  if ('cData' in shorthand) {
    return `<![CDATA[ ${shorthand.cData} ]]>`
  }
  if ('target' in shorthand && 'data' in shorthand) {
    return `<!--${shorthand.target} ${shorthand.data}-->`
  }
  if ('name' in shorthand && 'value' in shorthand) {
    return `${shorthand.name}="${String(shorthand.value)}"`
  }
  return ''
}

/**
 * Tries to retrieve and convert the contents of a DOM Node shorthand to their expanded forms.
 * @function
 * @param {DOMElementShorthand | DOMFragmentShorthand} desciption - node shorthand that can have contents
 * @returns {DOMNodeDescription[] | undefined} resulting child node descriptions
 */
export function getShorthandContentDescription (
  shorthand: DOMElementShorthand | DOMFragmentShorthand
): DOMNodeDescription[] | undefined {
  if (shorthand.content != null) {
    const childNodes = []
    for (const childShorthand of shorthand.content) {
      const childDescription = shorthandToDOMDescription(childShorthand)
      if (childDescription != null) {
        childNodes.push(childDescription)
      }
    }
    return childNodes
  }
}

/**
 * Tries to build the shorthand for the provided node.
 * @function
 * @param {Node} source - node to be evaluated
 * @returns {DOMNodeShorthand | undefined}
 */
export function getNodeShorthand (
  source: Node
): DOMNodeShorthand | undefined {
  const description = describeNode(source)
  const shorthand = DOMDescriptionToShorthand(description)
  return shorthand
}

/**
 * Tries to build the shorthands for the provided node's children.
 * @function
 * @param {Node} source - node to be evaluated
 * @returns {DOMNodeShorthand[]}
 */
export function getNodeContentShorthands (
  source: Node
): DOMNodeShorthand[] {
  const descriptions = describeNodeList(source.childNodes)
  const shorthands = descriptions
    .map(item => DOMDescriptionToShorthand(item))
    .filter(item => item != null) as DOMNodeShorthand[]
  return shorthands
}

/**
 * Tries to cast the provided data to an appropriate DOM Node shorthand.
 * @function
 * @param {unknown} target - data to be recast
 * @returns {DOMNodeShorthand | undefined} provided target if valid or undefined if invalid
 */
export function validateDOMShorthand (target: unknown): DOMNodeShorthand | undefined {
  switch (typeof target) {
    case 'string': {
      return target
    }
    case 'object': {
      if (target != null) {
        if ('tag' in target) {
          return target as DOMElementShorthand
        }
        if ('name' in target && 'value' in target) {
          return target as DOMAttributeShorthand
        }
        if ('cData' in target) {
          return target as DOMCDataShorthand
        }
        if ('target' in target && 'data' in target) {
          return target as DOMProcessingInstructionShorthand
        }
        if ('comment' in target) {
          return target as DOMCommentShorthand
        }
        const keys = Object.keys(target)
        if (
          keys.length < 1 ||
          (keys.length === 1 && keys[0] === 'content')
        ) {
          return target as DOMFragmentShorthand
        }
      }
      break
    }
  }
}

/**
 * Sets the node's properties and children based on the provided shorthand.
 * @function
 * @param {Node} node - node to be modified
 * @param {DOMNodeShorthand} shorthand - covers the desired state of the node
 * @returns {Node | undefined} if a new node had to created, that will be returned
 */
export function applyNodeChangeShorthand (
  node: Node,
  shorthand: DOMNodeShorthand
): Node | undefined {
  const description = shorthandToDOMDescription(shorthand)
  const updatedNode = applyDescribedNodeChanges(node, description)
  return updatedNode
}

/**
 * Tries to update the node's children from the provided shorthands.
 * @function
 * @param {Node} node - node whose children are to be modified
 * @param {DOMNodeShorthand} descriptions - covers the desired state of the node's children
 * @returns {DOMElementDescription[]}
 */
export function setNodeContentFromShorthands (
  target: Node,
  shorthands: DOMNodeShorthand[]
): DOMElementDescription[] {
  const descriptions = shorthands.map(shorthand => shorthandToDOMDescription(shorthand))
  setChildNodesFromDescriptions(target, descriptions)
  return descriptions
}
