import React from 'react'
import { CCard, CCardHeader } from '@coreui/react'
import { useDispatch, useSelector } from 'react-redux'
import { setDefaultusageLocation } from 'src/store/features/app'
import countryList from 'src/data/countryList'
import Select from 'react-select'

const UsageLocation = () => {
  const dispatch = useDispatch()
  const usagelocation = useSelector((state) => state.app.usageLocation)
  const Switchusage = (t, n) => {
    dispatch(setDefaultusageLocation({ usageLocation: t }))
  }

  return (
    <>
      <p>
        <h6>Default Usage Location</h6>
      </p>
      <Select
        className="react-select-container"
        classNamePrefix="react-select"
        options={countryList.map(({ Code, Name }) => ({
          value: Code,
          label: Name,
        }))}
        isClearable={true}
        name="usageLocation"
        value={usagelocation}
        placeholder="Type to search..."
        label="Usage Location"
        onChange={(value) => Switchusage(value)}
      />
    </>
  )
}

export default UsageLocation
