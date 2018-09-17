import * as ts from 'typescript'

enum JsxType {
  SelfClosing = 0,
  Standard = 1
}

interface EditedNode extends ts.Node {
  edited?: boolean
}

export interface Option {
  pragma?: string
}

const createObjectAssign = (params: ReadonlyArray<ts.Expression>) => {
  return ts.createCall(
    ts.createPropertyAccess(ts.createIdentifier('Object'), 'assign'),
    [],
    [
      ts.createObjectLiteral(),
      ...params
    ]
  )
}

const transformToProperties = (node: ts.Node) => {
  const ret: ts.Expression[] = []

  node.getChildren().forEach((childNode) => {
    if (ts.isJsxText(childNode)) {
      return
    }

    if (ts.isJsxExpression(childNode)) {
      ret.push(childNode.getChildAt(1) as ts.Expression)
      return
    }

    const editedNode = ts.getMutableClone<EditedNode>(childNode)
    editedNode.edited = true
    ret.push(editedNode as ts.Expression)
  })

  return ret
}

const transformToPropertyAssignment = (attrs: ts.JsxAttribute[]) => {
  return attrs.reduce((acc: ts.PropertyAssignment[], curr) => {
    const identifier = curr.getChildAt(0).getText()
    const jsxExpr = curr.getChildAt(2)

    acc.push(ts.createPropertyAssignment(
      ts.createIdentifier(identifier),
      jsxExpr.getChildAt(1) as ts.Expression
    ))

    return acc
  }, [])
}

export function createTransformer(option?: Option) {
  const defaultOptions = {
    pragma: 'sfc'
  }

  const transformerOptions = Object.assign({}, defaultOptions, option)

  const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
    const visitor: ts.Visitor = (node) => {

      if (!ts.isJsxElement(node) && !ts.isJsxSelfClosingElement(node)) {
        return ts.visitEachChild(node, visitor, context)
      }

      const currentJsxNode = node as ts.JsxElement
      const JsxNodeType = ts.isJsxSelfClosingElement(currentJsxNode)
        ? JsxType.SelfClosing
        : JsxType.Standard

      const attributes = JsxNodeType === JsxType.SelfClosing
        ? currentJsxNode.getChildAt(2) as ts.JsxAttributes
        : currentJsxNode.openingElement.getChildAt(2) as ts.JsxAttributes

      const functionIdentifier = JsxNodeType === JsxType.SelfClosing
        ? node.getChildAt(1).getText()
        : currentJsxNode.openingElement.getChildAt(1).getText()

      const spreadAttrs: ts.Expression[] = []
      const attrs: ts.JsxAttribute[] = []
      let isSFC = false

      attributes.forEachChild((child: ts.Node) => {
        if (ts.isJsxSpreadAttribute(child)) {
          spreadAttrs.push(child.getChildAt(2) as ts.Expression)
        } else if (ts.isJsxAttribute(child)) {
          if (child.name.getText().trim() === transformerOptions.pragma) {
            if (child.getChildCount() === 1) {
              // handle:
              // e.g.
              // 	  <Avatar sfc />
              isSFC = true
            } else {
              // handle:
              // e.g.
              //    <Avatar sfc={ true } />
              if (child.getChildCount() >= 2) {
                if (/\{\s*true\s*\}/.test(child.getChildAt(2).getText())) {
                  isSFC = true
                }
              }
            }
          } else {
            attrs.push(child)
          }
        }
      })

      if (isSFC) {
        const params: ts.Expression[] = []
        if (JsxNodeType === JsxType.Standard) {
          // ast: JsxElement -> SyntaxList
          const children = transformToProperties(currentJsxNode.getChildAt(1))

          const standaloneAttrs = transformToPropertyAssignment(attrs)

          const assignNode = createObjectAssign([
            ...spreadAttrs,
            ts.createObjectLiteral([
              ts.createPropertyAssignment(
                ts.createIdentifier('children'),
                ts.createArrayLiteral(children),
              ),
              ...standaloneAttrs
            ])
          ])

          params.push(assignNode)
        } else {
          // avoid following case:
          // <div { ...params } /> -> div(Object.assign({}, params))
          //
          // it will be:
          // <div { ...params } /> -> div(params)

          if (spreadAttrs.length === 1 && attrs.length === 0)  {
            params.push(...spreadAttrs)
          } else if (spreadAttrs.length > 0 || attrs.length > 0) {
            const assignArgs = []
            if (spreadAttrs.length > 0) {
              assignArgs.push(...spreadAttrs)
            }

            if (attrs.length > 0) {
              assignArgs.push(
                ts.createObjectLiteral([
                  ...transformToPropertyAssignment(attrs)
                ])
              )
            }

            params.push(createObjectAssign(assignArgs))
          }
        }

        const identifier = ts.createIdentifier(functionIdentifier)
        const callExpr = ts.createCall(identifier, [], params)

        if (ts.isJsxElement(node.parent!) && !(node as EditedNode).edited) {
          return ts.visitEachChild(ts.createJsxExpression(undefined, callExpr), visitor, context)
        }

        return ts.visitEachChild(callExpr, visitor, context)
      }

      const editedAttributes = attributes.getChildAt(0).getChildren().filter((c) => {
        if (ts.isJsxAttribute(c) && c.name.getText().trim() === transformerOptions.pragma) {
          return false
        }
        return true
      }) as ts.JsxAttribute[]

      if (ts.isJsxSelfClosingElement(currentJsxNode)) {
        currentJsxNode.attributes = ts.updateJsxAttributes(attributes, editedAttributes)
        return ts.visitEachChild(currentJsxNode, visitor, context)
      } else {
        currentJsxNode.openingElement.attributes = ts.updateJsxAttributes(attributes, editedAttributes)
        return ts.visitEachChild(currentJsxNode, visitor, context)
      }
    }

    return (node) => ts.visitNode(node, visitor)
  }

  return transformer
}

export default createTransformer
