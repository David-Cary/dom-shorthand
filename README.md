# DOM Shorthand
This library provides a couple light-weight, json friendly ways of representing DOM Nodes.  Unlike many such libraries, this one focuses on providing support for all DOM Node types, not just text and elements.

The more verbose and generic of these are node descriptions (`DOMNodeDescription`).  These cover a handful of properties common to all DOM nodes, with a sub-type to support element attributes.

The more compact forms are DOM shorthands.  These objects and strings represent specific kinds of node by focusing on that types distinctive properties.

# Quickstart
## Installation
You can install this library though npm like so:
```
$ npm install --save dom-shorthand
```

## Usage
If you've got a DOM node you want summed up, the easiest way to do so is just calling `describeNode`, like this:
```
import { describeNode } from 'dom-shorthand'

const block = document.createElement('div')

const description = describeNode(block)
```

That will show you the node type and node name for the node, as it's value or child nodes if it has those.  Elements will also show their attributes as a key-value map.

You can also flip this around to create a node from it's description, like this:
```
import {
  NodeType,
  createDescribedNode
} from 'dom-shorthand'

const block = createDescribedNode({
  nodeType: NodeType.ELEMENT_NODE,
  nodeName: 'DIV'
})
```

While this approach works well, it's a bit verbose.  It's also not especially readable when exported as that type will be cast as a number.  To get around this, we've provided a number of dom shorthand interfaces.  These shorthands do need to be expanded into full descriptions before being converted to nodes.

Here's what the process would look like for the above example:
```
import {
  shorthandToDOMDescription,
  createDescribedNode
} from 'dom-shorthand'

const description = shorthandToDOMDescription({ tag: 'DIV' })
const block = createDescribedNode(description)
```

The following short hands are currently supported.  These cover all types of nodes you can create through a document, though this doesn't include documents or document type nodes.
 * Text nodes are represented by strings.
 * Element nodes always have a `tag` property and may have an `attributes` key-value map or a `content` array with shorthands for all their child nodes.  Note that this can include non-element nodes, unlike an element node's children property.
 * Attribute nodes are represented by objects with a `name` and `value` property, acting like key-value pairs. (ex. `{ name: 'class', value: 'main'}`)
 * Processing instructions are similar, with a `target` property covering what they apply to and a `data` string for the information passed to that target.
 * Comments are simply objects with a lone `comment` property containing their text. (ex. `{ comment: "Hi there!" }`)
 * CDATASections work much like objects, with a lone `cData` property containing their characters.
 * Document fragments can be either empty objects or have a `content` array of other node shorthands, much like elements.

Should you need it, there's also a `validateDOMShorthand` function to check if any unknown value matches at least 1 of these shorthand profiles.  There are also dedicated functions to create descriptions for specific node types from a set of parameters.  These are less flexible that using `shorthandToDOMDescription`, but can be faster if you already know what type of node you want (ex. `createElementDescription('DIV')`).
