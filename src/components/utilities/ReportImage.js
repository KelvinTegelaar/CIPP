import React from 'react'
import { CCol, CRow } from '@coreui/react'
import { useDispatch, useSelector } from 'react-redux'
import { setReportImage } from 'src/store/features/app'

const ReportImage = () => {
  const dispatch = useDispatch()
  const inputRef = React.useRef(null)
  const ReportImage = useSelector((state) => state.app.reportImage)

  const Switchusage = (e) => {
    const reader = new FileReader()
    reader.readAsDataURL(e.target.files[0])
    reader.onloadend = () => {
      dispatch(setReportImage({ reportImage: reader.result }))
    }
  }

  return (
    <>
      <CRow className="align-items-center justify-content-center text-center">
        <CCol className="mb-3">
          <label>Default Report Image</label>
        </CCol>
      </CRow>
      <CRow className="align-items-center justify-content-center text-center">
        <CCol className="mb-3 image-upload-container" onClick={() => inputRef.current.click()}>
          <img src={ReportImage} alt="Report" className="upload-image" />
          <div className="image-upload-overlay">
            <div className="overlay-text">Click to Change</div>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/png"
            style={{ display: 'none' }}
            id="contained-button-file"
            onChange={(e) => Switchusage(e)}
          />
        </CCol>
      </CRow>
    </>
  )
}

export default ReportImage
