/**
 * @jest-environment jsdom
 */
import {
  NodeType,
  describeNode,
  createDescribedNode,
  createTextNodeDescription
} from '../src/dom/dom-nodes'
import {
  DOMDescriptionToShorthand,
  shorthandToDOMDescription
} from '../src/dom/dom-shorthands'

const sampleDescriptions = {
  element: {
    nodeType: NodeType.ELEMENT_NODE,
    nodeName: 'P',
    attributes: {
      class: 'main'
    },
    childNodes: [
      {
        nodeType: NodeType.TEXT_NODE,
        nodeName: '#text',
        nodeValue: 'Hi!'
      }
    ]
  },
  attribute: {
    nodeType: NodeType.ATTRIBUTE_NODE,
    nodeName: 'id',
    nodeValue: 'me'
  },
  text: {
    nodeType: NodeType.TEXT_NODE,
    nodeName: '#text',
    nodeValue: 'Hi!'
  },
  cData: {
    nodeType: NodeType.CDATA_SECTION_NODE,
    nodeName: '#cdata-section',
    nodeValue: 'stuff'
  },
  comment: {
    nodeType: NodeType.COMMENT_NODE,
    nodeName: '#comment',
    nodeValue: 'stuff'
  },
  instruction: {
    nodeType: NodeType.PROCESSING_INSTRUCTION_NODE,
    nodeName: 'xml',
    nodeValue: 'stuff'
  }
}

describe("describeNode", () => {
  it("should convert a node to a json friendly description", () => {
    const block = document.createElement('div')
    block.setAttribute('class', 'main')
    const content = document.createTextNode(sampleDescriptions.text.nodeValue)
    block.appendChild(content)
    const description = describeNode(block)
    expect(description).toEqual({
      nodeType: NodeType.ELEMENT_NODE,
      nodeName: 'DIV',
      attributes: {
        class: 'main'
      },
      childNodes: [
        sampleDescriptions.text
      ]
    })
  })
  it("should capture event listeners", () => {
    const block = document.createElement('div')
    block.innerHTML = `<span click="doSomething()">Click Me</span>`
    const description = describeNode(block)
    expect(description).toEqual({
      nodeType: NodeType.ELEMENT_NODE,
      nodeName: 'DIV',
      attributes: {},
      childNodes: [
        {
          nodeType: NodeType.ELEMENT_NODE,
          nodeName: 'SPAN',
          attributes: {
            click: "doSomething()"
          },
          childNodes: [
            {
              nodeType: NodeType.TEXT_NODE,
              nodeName: '#text',
              nodeValue: "Click Me"
            }
          ]
        }
      ]
    })
  })
})

describe("createDescribedNode", () => {
  it("should create a node from a json friendly description", () => {
    const description = {
      nodeType: NodeType.ELEMENT_NODE,
      nodeName: 'DIV',
      attributes: {
        class: 'main'
      },
      childNodes: [
        sampleDescriptions.text
      ]
    }
    const node = createDescribedNode(description)
    expect(node).toBeDefined()
    if (node != null) {
      expect(node.nodeName).toEqual('DIV')
      expect(node.attributes.get('class')).toEqual('main')
      expect(node.childNodes.length).toEqual(1)
      expect(node.innnerHTML).toEqual(sampleDescriptions.text)
    }
  })
})

const sampleShorthands = {
  element: {
    tag: 'P',
    attributes: {
      class: 'main'
    },
    content: [ sampleDescriptions.text.nodeValue ]
  },
  attribute: {
    name: 'id',
    value: 'me'
  },
  text: sampleDescriptions.text.nodeValue,
  cData: {
    cData: 'stuff'
  },
  instruction: {
    target: 'xml',
    data: 'stuff'
  },
  comment: {
    comment: 'stuff'
  }
}

describe("DOMDescriptionToShorthand", () => {
  it("should convert text nodes to a string", () => {
    const shorthand = DOMDescriptionToShorthand(sampleDescriptions.text)
    expect(shorthand).toEqual(sampleShorthands.text)
  })
  it("should convert element nodes to tagged data", () => {
    const shorthand = DOMDescriptionToShorthand(sampleDescriptions.element)
    expect(shorthand).toEqual(sampleShorthands.element)
  })
  it("should convert attribute nodes to name value pairs", () => {
    const shorthand = DOMDescriptionToShorthand(sampleDescriptions.attribute)
    expect(shorthand).toEqual(sampleShorthands.attribute)
  })
  it("should convert cdata section nodes to a text wrapper", () => {
    const shorthand = DOMDescriptionToShorthand(sampleDescriptions.cData)
    expect(shorthand).toEqual(sampleShorthands.cData)
  })
  it("should convert comment nodes to a text wrapper", () => {
    const shorthand = DOMDescriptionToShorthand(sampleDescriptions.comment)
    expect(shorthand).toEqual(sampleShorthands.comment)
  })
  it("should convert processing instruction nodes to targetted data", () => {
    const shorthand = DOMDescriptionToShorthand(sampleDescriptions.instruction)
    expect(shorthand).toEqual(sampleShorthands.instruction)
  })
})

describe("shorthandToDOMDescription", () => {
  it("should convert strings to text nodes", () => {
    const shorthand = shorthandToDOMDescription(sampleShorthands.text)
    expect(shorthand).toEqual(sampleDescriptions.text)
  })
  it("should convert tagged data to element nodes", () => {
    const shorthand = shorthandToDOMDescription(sampleShorthands.element)
    expect(shorthand).toEqual(sampleDescriptions.element)
  })
  it("should convert name value pairs to attribute nodes", () => {
    const shorthand = shorthandToDOMDescription(sampleShorthands.attribute)
    expect(shorthand).toEqual(sampleDescriptions.attribute)
  })
  it("should convert anything with cData to cdata section nodes", () => {
    const shorthand = shorthandToDOMDescription(sampleShorthands.cData)
    expect(shorthand).toEqual(sampleDescriptions.cData)
  })
  it("should convert anything with comment text to comment nodes", () => {
    const shorthand = shorthandToDOMDescription(sampleShorthands.comment)
    expect(shorthand).toEqual(sampleDescriptions.comment)
  })
  it("should convert targetted data to processing instruction nodes", () => {
    const shorthand = shorthandToDOMDescription(sampleShorthands.instruction)
    expect(shorthand).toEqual(sampleDescriptions.instruction)
  })
})
