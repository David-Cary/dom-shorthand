/**
 * @jest-environment jsdom
 */
import {
  NodeType,
  describeNode,
  checkEquivalence,
  createDescribedNode,
  createTextNodeDescription,
  nodeMatchesDescription,
  setChildNodesFromDescriptions
} from '../src/dom/dom-nodes'
import {
  DOMDescriptionToShorthand,
  shorthandToDOMDescription,
  shorthandToHTML
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
  emptyAttributeElement: {
    nodeType: NodeType.ELEMENT_NODE,
    nodeName: 'P',
    attributes: {},
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
      const element = node as HTMLElement
      expect(element.getAttribute('class')).toEqual('main')
      expect(node.childNodes.length).toEqual(1)
      expect(element.innerHTML).toEqual(sampleDescriptions.text.nodeValue)
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
  emptyAttributeElement: {
    tag: 'P',
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
  it("should skip adding attributes if there are no attributes", () => {
    const shorthand = DOMDescriptionToShorthand(sampleDescriptions.emptyAttributeElement)
    expect(shorthand).toEqual(sampleShorthands.emptyAttributeElement)
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

describe("shorthandToHTML", () => {
  it("should handle elements, as well as their attributes and children", () => {
    const html = shorthandToHTML({
      tag: 'p',
      attributes: {
        class: "main"
      },
      content: [
        { comment: "testing" },
        "Be ",
        {
          tag: 'b',
          content: ["bold"]
        }
      ]
    })
    expect(html).toBe(`<p class="main"><!--testing-->Be <b>bold</b></p>`)
  })
  it("should wrap cdata", () => {
    const html = shorthandToHTML({
      cData: "< > &"
    })
    expect(html).toBe(`<![CDATA[ < > & ]]>`)
  })
  it("should handle fragments", () => {
    const html = shorthandToHTML({
      content: [
        "Be ",
        {
          tag: 'b',
          content: ["bold"]
        }
      ]
    })
    expect(html).toBe(`Be <b>bold</b>`)
  })
  it("should only use a single set of brackets for elements without content, like BR", () => {
    const html = shorthandToHTML({
      content: [
        "1 line",
        {
          tag: 'br'
        }
      ]
    })
    expect(html).toBe(`1 line<br/>`)
  })
  it("should treat processing instructions as comments", () => {
    const html = shorthandToHTML({
      target: 'xml',
      data: `version="1.0"`
    })
    expect(html).toBe(`<!--xml version="1.0"-->`)
  })
})

describe("setChildNodesFromDescriptions", () => {
  const block = document.createElement('div')
  it("should remove excess children", () => {
    block.innerHTML = "a<b>b</b>c"
    const node = setChildNodesFromDescriptions(
      block,
      [
        { nodeType: NodeType.TEXT_NODE, nodeName: '#text', nodeValue: '1' }
      ]
    )
    expect(block.innerHTML).toBe('1')
  })
  it("should set child attributes", () => {
    block.innerHTML = '<img name="a" src="x">'
    const node = setChildNodesFromDescriptions(
      block,
      [
        {
          nodeType: NodeType.ELEMENT_NODE,
          nodeName: 'IMG',
          attributes: { src: 'y' }
        }
      ]
    )
    expect(block.innerHTML).toBe('<img src="y">')
  })
  it("should apply to nested descendants", () => {
    block.innerHTML = '<b>a</b>'
    const node = setChildNodesFromDescriptions(
      block,
      [
        {
          nodeType: NodeType.ELEMENT_NODE,
          nodeName: 'B',
          childNodes: [
            { nodeType: NodeType.TEXT_NODE, nodeName: '#text', nodeValue: '1' }
          ]
        }
      ]
    )
    expect(block.innerHTML).toBe('<b>1</b>')
  })
  it("should replace child with different node names", () => {
    block.innerHTML = '<b>a</b>'
    const node = setChildNodesFromDescriptions(
      block,
      [
        {
          nodeType: NodeType.ELEMENT_NODE,
          nodeName: 'U',
          childNodes: [
            { nodeType: NodeType.TEXT_NODE, nodeName: '#text', nodeValue: '1' }
          ]
        }
      ]
    )
    expect(block.innerHTML).toBe('<u>1</u>')
  })
})

describe("nodeMatchesDescription", () => {
  const block = document.createElement('div')
  const text = document.createTextNode('Hi')
  it("should detect nodeType change", () => {
    const matched = nodeMatchesDescription(text, { nodeType: NodeType.COMMENT_NODE })
    expect(matched).toBe(false)
  })
  it("should detect nodeValue change", () => {
    const matched = nodeMatchesDescription(
      text,
      {
        nodeType: NodeType.TEXT_NODE,
        nodeValue: 'bye'
      }
    )
    expect(matched).toBe(false)
  })
  it("should verify matching text node", () => {
    const matched = nodeMatchesDescription(
      text,
      {
        nodeType: NodeType.TEXT_NODE,
        nodeValue: 'Hi'
      }
    )
    expect(matched).toBe(true)
  })
  it("should detect missing attribute", () => {
    const matched = nodeMatchesDescription(
      text,
      {
        nodeType: NodeType.ELEMENT_NODE,
        attributes: { class: 'main' }
      }
    )
    expect(matched).toBe(false)
  })
  const paragraph = document.createElement('p')
  paragraph.setAttribute('class', 'main')
  block.appendChild(paragraph)
  paragraph.appendChild(text)
  it("should detect child changes", () => {
    const matched = nodeMatchesDescription(
      text,
      {
        nodeType: NodeType.ELEMENT_NODE,
        childNodes: [
          {
            nodeType: NodeType.ELEMENT_NODE,
            attributes: { class: 'body' }
          }
        ]
      }
    )
    expect(matched).toBe(false)
  })
  it("should verify element with children", () => {
    const matched = nodeMatchesDescription(
      block,
      {
        nodeType: NodeType.ELEMENT_NODE,
        nodeName: 'DIV',
        childNodes: [
          {
            nodeType: NodeType.ELEMENT_NODE,
            nodeName: 'P',
            attributes: { class: 'main' },
            childNodes: [
              {
                nodeType: NodeType.TEXT_NODE,
                nodeValue: 'Hi'
              }
            ]
          }
        ]
      }
    )
    expect(matched).toBe(true)
  })
})

describe("checkEquivalence", () => {
  it("should do direct comparison on primitives", () => {
    const badMatch = checkEquivalence(1, 2)
    expect(badMatch).toEqual(false)
    const goodMatch = checkEquivalence(1, 1)
    expect(goodMatch).toEqual(true)
  })
  it("should detect object mismatch", () => {
    const matched = checkEquivalence([1], { value: 1 })
    expect(matched).toEqual(false)
  })
  it("should detect element mismatch", () => {
    const matched = checkEquivalence([1, 2], [1, 3])
    expect(matched).toEqual(false)
  })
  it("should detect property mismatch", () => {
    const matched = checkEquivalence({ x: 1, y: 1 }, { x: 1, y: 2})
    expect(matched).toEqual(false)
  })
  it("should validate equivalent objects", () => {
    const matched = checkEquivalence(
      {
        name: 'bin',
        contents: [
          {
            name: 'hat'
          }
        ]
      },
      {
        name: 'bin',
        contents: [
          {
            name: 'hat'
          }
        ]
      }
    )
    expect(matched).toEqual(true)
  })
})