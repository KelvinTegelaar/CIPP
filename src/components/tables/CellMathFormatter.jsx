import React from 'react'
import { CBadge, CTooltip } from '@coreui/react'
import CellBoolean from 'src/components/tables/CellBoolean.jsx'
import cellTable from './CellTable'

export function CellTip(cell, overflow = false) {
  return (
    <CTooltip content={String(cell)}>
      <div className="celltip-content-nowrap">{String(cell)}</div>
    </CTooltip>
  )
}
export const cellMathFormatter =
  ({ col } = {}) =>
  (row) => {
    const evaluateCalculation = (calculation, row) => {
      try {
        const formattedCalculation = calculation.replace(/\b\w+(\.\w+|\[\d+\])*\b/g, (key) => {
          if (!isNaN(key)) {
            return parseFloat(key)
          }

          const path = key.split(/\.|\[(\d+)\]/).filter(Boolean) // Splits keys and array indices
          let currentObject = row
          for (const prop of path) {
            if (currentObject && prop in currentObject) {
              currentObject = currentObject[prop]
            } else if (!isNaN(prop)) {
              // Checks if the prop is an array index
              currentObject = currentObject[parseInt(prop, 10)]
            } else {
              throw new Error(`Property '${prop}' not found in row`)
            }
          }

          return parseFloat(currentObject)
        })

        return Number(eval(formattedCalculation))
      } catch (e) {
        console.error(e)
        return null
      }
    }

    const result = evaluateCalculation(col.value, row)

    if (result === null) {
      return 'N/A'
    }

    if (col.showAs === 'percentage') {
      return `${result.toFixed(2)}%`
    } else {
      return result.toFixed(2)
    }
  }

export default cellMathFormatter
