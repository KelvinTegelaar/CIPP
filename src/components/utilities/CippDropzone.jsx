import React, { useCallback, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { CippContentCard } from 'src/components/layout'
import { useDropzone } from 'react-dropzone'
import styled from 'styled-components'
import { useMediaPredicate } from 'react-media-hook'
import { useSelector } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const getColor = (props) => {
  if (props.isDragAccept) {
    return '#00e676'
  }
  if (props.isDragReject) {
    return '#ff1744'
  }
  if (props.isFocused) {
    return '#2196f3'
  }
  return '#eeeeee'
}

const BackgroundColor = () => {
  const currentTheme = useSelector((state) => state.app.currentTheme)
  const preferredTheme = useMediaPredicate('(prefers-color-scheme: dark)') ? 'impact' : 'cyberdrain'
  const isDark =
    currentTheme === 'impact' || (currentTheme === 'default' && preferredTheme === 'impact')

  if (isDark) {
    return '#333'
  } else {
    return '#fafafa'
  }
}

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border-width: 2px;
  border-radius: 2px;
  border-color: ${(props) => getColor(props)};
  border-style: dashed;
  background-color: ${() => BackgroundColor()};
  color: #bdbdbd;
  outline: none;
  transition: border 0.24s ease-in-out;
`

const CippDropzone = ({ title, onDrop, dropMessage, accept, maxFiles = 1, ...props }) => {
  const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: accept,
    maxFiles: maxFiles,
  })
  return (
    <CippContentCard title={title} {...props}>
      <div className="container my-2">
        <Container {...getRootProps({ isFocused, isDragAccept, isDragReject })}>
          <input {...getInputProps()} />
          <span>{dropMessage}</span>
        </Container>
      </div>
    </CippContentCard>
  )
}

CippDropzone.propTypes = {
  title: PropTypes.string,
  onDrop: PropTypes.func.isRequired,
  dropMessage: PropTypes.string,
  accept: PropTypes.object,
  maxFiles: PropTypes.number,
}

export default CippDropzone
