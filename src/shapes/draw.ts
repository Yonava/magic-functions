/*
  This file contains helper functions for drawing shapes on the canvas.
*/
import { getAngle, calculateLineSegmentEndpointsGivenSegmentCenterPoint } from "./helpers";
import {
  LINE_DEFAULTS,
  TEXT_DEFAULTS,
  TEXTAREA_DEFAULTS,
  type Line,
  type Arrow,
  type TextArea,
  type TextAreaNoLocation,
  type Coordinate,
} from "./types"
import { drawCircleWithCtx } from "./draw/circle";
import { drawSquareWithCtx } from "./draw/square";
import { drawLineWithCtx } from "./draw/line";
import { drawTriangleWithCtx } from "./draw/triangle";
import { drawArrowWithCtx } from "./draw/arrow";
import { drawUTurnArrowWithCtx } from "./draw/uturn";

// given a shape that supports the text area api, get back the full text area with the location
type LocationTextAreaGetter = Record<string, (shape: Line | Arrow) => Coordinate>
export const getLocationTextArea = (textArea: TextAreaNoLocation): LocationTextAreaGetter => ({
  line: (line: Line) =>  getLocationTextAreaOnLine(line),
  arrow: (arrow: Arrow) => getLocationTextAreaOnArrow(arrow)
})

export const getLocationTextAreaOnArrow = (line: Line) => {
  const {
    textOffsetFromCenter,
    start: lineStart,
    end: lineEnd,
    textArea,
    width,
    color
  } = {
    ...LINE_DEFAULTS,
    ...line,
  }

  const angle = Math.atan2(lineEnd.y - lineStart.y, lineEnd.x - lineStart.x);
  const arrowHeadHeight = width * 2.5;

  const shaftEnd = {
    x: lineEnd.x - arrowHeadHeight * Math.cos(angle),
    y: lineEnd.y - arrowHeadHeight * Math.sin(angle),
  }

  const shaft = {
    start: lineStart,
    end: shaftEnd,
    width,
    color,
    textOffsetFromCenter,
    textArea,
  }

  return getLocationTextAreaOnLine(shaft);
}

export const getLocationTextAreaOnLine = (line: Line) => {
  const {
    textOffsetFromCenter,
    start,
    end,
    textArea,
  } = {
    ...LINE_DEFAULTS,
    ...line,
  }

  if (!textArea) return { x: 0, y: 0 }

  const { text } = textArea;

  const { fontSize } = {
    ...TEXT_DEFAULTS,
    ...text,
  }

  const theta = getAngle(start, end);

  const offsetX = textOffsetFromCenter * Math.cos(theta);
  const offsetY = textOffsetFromCenter * Math.sin(theta);

  const textX = (start.x + end.x) / 2 + offsetX;
  const textY = (start.y + end.y) / 2 + offsetY;

  return {
    x: textX - fontSize,
    y: textY - fontSize
  }
}

/**
 * @description parent function that returns all the draw functions for the shapes
 *
 * @param {CanvasRenderingContext2D} ctx - the canvas context to draw the shapes on
 * @returns an object that aggregates all the draw functions to draw a shape on the canvas
 */
export const drawShape = (ctx: CanvasRenderingContext2D) => ({
  drawCircle: drawCircleWithCtx(ctx),
  drawLine: drawLineWithCtx(ctx),
  drawSquare: drawSquareWithCtx(ctx),
  drawTriangle: drawTriangleWithCtx(ctx),
  drawArrow: drawArrowWithCtx(ctx),
  drawUTurnArrow: drawUTurnArrowWithCtx(ctx),
})

export const drawTextAreaWithCtx = (ctx: CanvasRenderingContext2D) => ({
  line: (line: Line) => {
    if (!line.textArea) return;
    const textArea = {
      ...TEXTAREA_DEFAULTS,
      ...line.textArea,
    }
    const text = {
      ...TEXT_DEFAULTS,
      ...line.textArea.text,
    }
    const fullTextArea = {
      ...textArea,
      text,
      at: getLocationTextAreaOnLine(line),
    }
    const { width, height } = getTextAreaDimension(fullTextArea);
    const matteLine = calculateLineSegmentEndpointsGivenSegmentCenterPoint(line.start, line.end, width, { x: fullTextArea.at.x + width / 2, y: fullTextArea.at.y + height / 2 })
    drawTextAreaMatte(ctx)(matteLine, fullTextArea);
    drawText(ctx)(fullTextArea);
  },
  arrow: (arrow: Arrow) => {
    if (!arrow.textArea) return;
    const textArea = {
      ...TEXTAREA_DEFAULTS,
      ...arrow.textArea,
    }
    const text = {
      ...TEXT_DEFAULTS,
      ...arrow.textArea.text,
    }
    const fullTextArea = {
      ...textArea,
      text,
      at: getLocationTextAreaOnArrow(arrow),
    }

    const { width, height } = getTextAreaDimension(fullTextArea);
    const matteLine = calculateLineSegmentEndpointsGivenSegmentCenterPoint(arrow.start, arrow.end, width, { x: fullTextArea.at.x + width / 2, y: fullTextArea.at.y + height / 2 })
    drawTextAreaMatte(ctx)(matteLine, fullTextArea);
    drawText(ctx)(fullTextArea);
  },
})

export type DeepRequired<T> = {
  [K in keyof T]-?: T[K] extends object
    ? DeepRequired<T[K]>
    : T[K];
};

export const getTextAreaDimension = (textArea: DeepRequired<TextArea>) => ({
  width: textArea.text.fontSize * 2,
  height: textArea.text.fontSize * 2,
});

export const drawTextAreaMatte = (ctx: CanvasRenderingContext2D) => (matteLine: Line, textArea: DeepRequired<TextArea>) => {

  const {
    start,
    end,
    width,
    color
  } = {
    ...matteLine,
    ...LINE_DEFAULTS
  }
  drawLineWithCtx(ctx)({
    start,
    end,
    width: width + 2,
    color: textArea.color
  })
}

export const drawText = (ctx: CanvasRenderingContext2D) => (textArea: DeepRequired<TextArea>) => {
  const { at } = textArea;
  const { content, fontSize, fontWeight, color } = textArea.text;

  ctx.font = `${fontWeight} ${fontSize}px Arial`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(content, at.x + fontSize, at.y + fontSize);
}