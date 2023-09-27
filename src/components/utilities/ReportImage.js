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
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png"
          style={{ display: 'none' }}
          id="contained-button-file"
          onChange={(e) => Switchusage(e)}
        />
        <p>Select a report image. This image has a size of 120x100 and can be up to 64KB.</p>
        <CButton
          type="button"
          name="file"
          onClick={() => inputRef.current.click()}
          className="me-2"
        >
          Upload new image
        </CButton>
      </div>
      <div style={{ marginLeft: '20px' }}>
        <CImage rounded={true} src={ReportImage} width={120} height={100} />
      </div>
    </div>
  )
}

export default ReportImage
