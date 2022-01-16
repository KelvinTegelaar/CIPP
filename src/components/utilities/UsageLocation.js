import React from 'react'
import { CCard, CCardHeader } from '@coreui/react'
import { useDispatch, useSelector } from 'react-redux'
import { setDefaultusageLocation } from 'src/store/features/app'
import countryList from 'src/data/countryList'
import SelectSearch, { fuzzySearch } from 'react-select-search'

const UsageLocation = () => {
  const dispatch = useDispatch()
  const usagelocation = useSelector((state) => state.app.usageLocation)
  const Switchusage = (t) => {
    // console.log(t)
    dispatch(setDefaultusageLocation({ usageLocation: t }))
  }

  return (
    <CCard>
      <CCardHeader>Select default usage location</CCardHeader>
      <SelectSearch
        options={countryList.map(({ Code, Name }) => ({
          value: Code,
          name: Name,
        }))}
        name="usageLocation"
        value={usagelocation}
        placeholder="Type to search..."
        label="Usage Location"
        onChange={(value) => Switchusage(value)}
        search
        filterOptions={fuzzySearch}
      />
    </CCard>
  )
}

export default UsageLocation
