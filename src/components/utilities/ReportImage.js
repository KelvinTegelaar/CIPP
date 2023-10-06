import React from 'react'
import { CButton, CCard, CCardBody, CCardHeader, CImage } from '@coreui/react'
import { useDispatch, useSelector } from 'react-redux'
import { setReportImage } from 'src/store/features/app'
import countryList from 'src/data/countryList'
import Select from 'react-select'
import { useRef } from 'react'

const ReportImage = () => {
  const dispatch = useDispatch()
  const inputRef = useRef(null)
  const ReportImage = useSelector((state) => state.app.reportImage)
  const Switchusage = (e) => {
    const reader = new FileReader()
    reader.readAsDataURL(e.target.files[0])
    reader.onloadend = () => {
      dispatch(setReportImage({ reportImage: reader.result }))
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h6>Default Report Image</h6>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <CImage className="mb-2" rounded={true} src={ReportImage} width={120} height={100} />
        <CButton type="button" name="file" onClick={() => inputRef.current.click()}>
          Upload new image
        </CButton>
        <input
          ref={inputRef}
          type="file"
          accept="image/png"
          style={{ display: 'none' }}
          id="contained-button-file"
          onChange={(e) => Switchusage(e)}
        />
      </div>
    </div>
  )
}

export default ReportImage
