import type {
  GEdge,
  GNode,
  LineSchemaItem,
  ArrowSchemaItem,
  ArrowUTurnSchemaItem
} from '../types'
import { getValue, getFromToNodes } from '../helpers'
import type { BaseGraphTheme } from '../themes'
import { getLargestAngularSpace } from '@/shapes/helpers'
import type { BaseGraphSettings } from '../useBaseGraph'

type EdgeSchemas = LineSchemaItem | ArrowSchemaItem | ArrowUTurnSchemaItem
type EdgeSchematic = Omit<EdgeSchemas, 'priority'> | undefined

export const getEdgeSchematic = (
  edge: GEdge,
  nodes: GNode[],
  edges: GEdge[],
  graphTheme: BaseGraphTheme,
  graphSettings: BaseGraphSettings,
  focusedId: GEdge['id'] | undefined
): EdgeSchematic => {

  const { from, to } = getFromToNodes(edge, nodes)

  const isBidirectional = edges.some(e => e.from === to.label && e.to === from.label)
  const isSelfDirecting = to === from

  const spacingAwayFromNode = 3

  const fromNodeSize = getValue(graphTheme.nodeSize, from) + spacingAwayFromNode
  const toNodeSize = getValue(graphTheme.nodeSize, to) + spacingAwayFromNode

  const fromNodeBorderWidth = getValue(graphTheme.nodeBorderWidth, from)
  const toNodeBorderWidth = getValue(graphTheme.nodeBorderWidth, to)

  const angle = Math.atan2(to.y - from.y, to.x - from.x);

  const epiCenter = {
    x: to.x - toNodeSize * Math.cos(angle),
    y: to.y - toNodeSize * Math.sin(angle),
  }

  const start = { x: from.x, y: from.y }
  const end = epiCenter

  const edgeWidthVal = getValue(graphTheme.edgeWidth, edge)

  const bidirectionalEdgeSpacing = edgeWidthVal * 1.2

  if (isBidirectional) {
    start.x += Math.cos(angle + Math.PI / 2) * bidirectionalEdgeSpacing
    start.y += Math.sin(angle + Math.PI / 2) * bidirectionalEdgeSpacing

    end.x += Math.cos(angle + Math.PI / 2) * bidirectionalEdgeSpacing
    end.y += Math.sin(angle + Math.PI / 2) * bidirectionalEdgeSpacing
  }

  const largestAngularSpace = getLargestAngularSpace(start, edges
    // remove self-referencing edge
    .filter((e) => (e.from === from.label || e.to === to.label) && e.from !== e.to)
    // convert to { x, y } format
    .map((e) => {
      const { from: fromNode, to: toNode } = getFromToNodes(e, nodes)
      return from.id === fromNode.id ? { x: toNode.x, y: toNode.y } : { x: fromNode.x, y: fromNode.y }
    })
    // remove duplicates (such as bi-directional edges)
    .filter((point, index, self) =>
      index === self.findIndex(
        (p) => p.x === point.x && p.y === point.y
      )
    )
  )

  const {
    edgeFocusColor: focusColor,
    edgeColor: color,
  } = graphTheme
  const isFocused = focusedId === edge.id
  const colorVal = getValue(isFocused ? focusColor : color, edge)

  const edgeTextColor = isFocused ? graphTheme.edgeFocusTextColor : graphTheme.edgeTextColor
  const edgeTextColorVal = getValue(edgeTextColor, edge)

  const textArea = {
    color: graphTheme.graphBgColor,
    editable: graphSettings.edgeLabelsEditable,
    text: {
      content: edge.weight.toString(),
      color: edgeTextColorVal,
      fontSize: getValue(graphTheme.edgeTextSize, edge),
      fontWeight: getValue(graphTheme.edgeTextFontWeight, edge),
    }
  }

  const upDistance = edgeWidthVal * 8
  const downDistance = upDistance * 0.35

  // returns the u-turn edge
  if (isSelfDirecting) {
    return {
      schema: {
        spacing: edgeWidthVal * 1.2,
        center: { x: from.x, y: from.y },
        upDistance,
        downDistance,
        angle: largestAngularSpace,
        lineWidth: edgeWidthVal,
        color: colorVal,
        textArea: graphSettings.displayEdgeLabels ? textArea : undefined,
      },
      schemaType: 'uturn',
      id: edge.id,
      graphType: 'edge',
    } as const;
  }
  
  const sumOfToAndFromNodeSize = fromNodeSize + fromNodeBorderWidth / 2 + toNodeSize + toNodeBorderWidth / 2
  const distanceSquaredBetweenNodes = (from.x - to.x) ** 2 + (from.y - to.y) ** 2
  const areNodesTouching = (sumOfToAndFromNodeSize ** 2) > distanceSquaredBetweenNodes
  if (areNodesTouching) return

  // returns the line edge
  if (edge.type === 'undirected') {
    return {
      schema: {
        start: { x: from.x, y: from.y },
        end: { x: to.x, y: to.y },
        color: colorVal,
        width: edgeWidthVal,
        textArea: graphSettings.displayEdgeLabels ? textArea : undefined,
      },
      schemaType: 'line',
      id: edge.id,
      graphType: 'edge',
    }
  }
  
  // returns the arrow edge
  return {
    schema: {
      start,
      end,
      color: colorVal,
      width: getValue(graphTheme.edgeWidth, edge),
      // TODO - must take into account of actual node size.
      // TODO - 32 is approx default node size but wont work if node size is different
      textOffsetFromCenter: 32,
      textArea: graphSettings.displayEdgeLabels ? textArea : undefined,
    },
    schemaType: 'arrow',
    id: edge.id,
    graphType: 'edge',
  } as const

}