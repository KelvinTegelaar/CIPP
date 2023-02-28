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
      console.log(reader.result)
      dispatch(setReportImage({ reportImage: reader.result }))
      console.log(ReportImage)
    }
  }

  return (
    <CCard>
      <CCardHeader>Upload a default report image</CCardHeader>
      <CCardBody>
        <input
          ref={inputRef}
          type="file"
          accept="image/png"
          style={{ display: 'none' }}
          id="contained-button-file"
          onChange={(e) => Switchusage(e)}
        />
        <center>
          Suggested image size: 120x100. This is a per user setting.<br></br>
          <CButton
            type="button"
            name="file"
            onClick={() => inputRef.current.click()}
            className="me-2"
          >
            Upload File
          </CButton>
          <br></br>
          <CImage className="card" src={ReportImage} thumbnail width={120} height={100} />
        </center>
      </CCardBody>
    </CCard>
  )
}

export default ReportImage
