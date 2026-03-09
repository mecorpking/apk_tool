import React, { useState, useCallback } from 'react'

export default function FileDropZone({ selectedFile, onSelect, onDrop }) {
  const [dragover, setDragover] = useState(false)

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragover(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragover(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragover(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      // Electron exposes .path on dropped File objects
      const filePath = files[0].path
      onDrop(filePath)
    }
  }, [onDrop])

  const handleClick = () => {
    onSelect()
  }

  if (selectedFile) {
    const fileName = selectedFile.split('/').pop().split('\\').pop()
    const dirPath = selectedFile.substring(0, selectedFile.length - fileName.length)

    return (
      <div
        className="dropzone has-file"
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="file-info">
          <div className="file-icon">
            <span role="img" aria-label="file">&#128230;</span>
          </div>
          <div className="file-details">
            <div className="file-name">{fileName}</div>
            <div className="file-path">{dirPath}</div>
          </div>
          <button className="btn-change" onClick={(e) => { e.stopPropagation(); onSelect() }}>
            Change
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`dropzone ${dragover ? 'dragover' : ''}`}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="dropzone-icon">&#128193;</div>
      <div className="dropzone-text">Drop AAB file here or click to browse</div>
      <div className="dropzone-hint">.aab files only</div>
    </div>
  )
}
