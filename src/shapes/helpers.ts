import type { Coordinate, Line } from "./types"

/**
 * @description rotates a point around a center point by a given angle in radians
 *
 * @param pointToRotate - the point that is to be rotated
 * @param centerPoint - the point that the pointToRotate will rotate around
 * @param angle - the angle in radians that the pointToRotate will rotate by
 * @returns the new point after rotation
 */
export const rotatePoint = (pointToRotate: Coordinate, centerPoint: Coordinate, angle: number) => {
  const cosA = Math.cos(angle)
  const sinA = Math.sin(angle)
  const dx = pointToRotate.x - centerPoint.x
  const dy = pointToRotate.y - centerPoint.y

  return {
    x: centerPoint.x + (dx * cosA - dy * sinA),
    y: centerPoint.y + (dx * sinA + dy * cosA)
  }
}

/**
 * @description same as rotatePoint but modifies the pointToRotate in place as opposed to returning a new point object
 *
 * @param pointToRotate - the point that is to be rotated
 * @param centerPoint - the point that the pointToRotate will rotate around
 * @param angle - the angle in radians that the pointToRotate will rotate by
 */
export const rotatePointInPlace = (pointToRotate: Coordinate, centerPoint: Coordinate, angle: number) => {
  const cosA = Math.cos(angle)
  const sinA = Math.sin(angle)
  const dx = pointToRotate.x - centerPoint.x
  const dy = pointToRotate.y - centerPoint.y

  pointToRotate.x = centerPoint.x + (dx * cosA - dy * sinA)
  pointToRotate.y = centerPoint.y + (dx * sinA + dy * cosA)
}

/**
 * @description calculates the angle between two points in radians
 *
 * @param point1 - the first point
 * @param point2 - the second point
 * @returns the angle between the two points in radians
 */
export const getAngle = (point1: Coordinate, point2: Coordinate) => {
  const { x: x1, y: y1 } = point1
  const { x: x2, y: y2 } = point2
  return Math.atan2(y2 - y1, x2 - x1)
}

/**
 * @description calculates the midpoint of the largest angular between a center point and a list of points
 *
 * @param center - the center point
 * @param points - the list of points
 * @returns the midpoint of the largest angular space
 */
export const getLargestAngularSpace = (center: Coordinate, points: Coordinate[]) => {
  if (points.length === 0) return 0
  const [ firstPoint ] = points
  if (points.length === 1) return getAngle(center, firstPoint) + Math.PI

  const angles = points
    .map((point) => getAngle(center, point))
    .sort((angleA, angleB) => angleA - angleB)

  let maxAngularDistance = 0
  let maxAngularDistanceIndex = 0

  for (let i = 0; i < angles.length; i++) {
    const nextAngle = (i + 1) % angles.length
    const angularDistance = (angles[nextAngle] - angles[i] + 2 * Math.PI) % (2 * Math.PI)
    if (angularDistance > maxAngularDistance) {
      maxAngularDistance = angularDistance
      maxAngularDistanceIndex = i
    }
  }

  return (angles[maxAngularDistanceIndex] + maxAngularDistance / 2) % (2 * Math.PI)
}

export const calculateLineSegmentEndpointsGivenSegmentCenterPoint = (
  lineStart: Coordinate,
  lineEnd: Coordinate,
  width: number,
  lineCenter: Coordinate
): Line => {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;

  const length = Math.sqrt(dx * dx + dy * dy);
  const unitDx = dx / length;
  const unitDy = dy / length;

  const halfWidth = width / 2;
  const offsetX = unitDx * halfWidth;
  const offsetY = unitDy * halfWidth;

  const start: Coordinate = {
    x: lineCenter.x - offsetX,
    y: lineCenter.y - offsetY
  };
  const end: Coordinate = {
    x: lineCenter.x + offsetX,
    y: lineCenter.y + offsetY
  };

  return { start, end };
}