import { useMemo, useRef, useState } from 'react'
import { Upload } from 'lucide-react'

function Dropzone({
  label,
  hint,
  accept,
  multiple = false,
  disabled = false,
  onFiles,
  className = '',
}) {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  const baseClass = useMemo(() => {
    const stateClass = disabled
      ? 'cursor-not-allowed opacity-60'
      : isDragging
        ? 'border-trae-600 bg-trae-50'
        : 'border-slate-200 bg-white hover:bg-slate-50'

    return `flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-colors focus:outline-none focus:ring-2 focus:ring-trae-600 focus:ring-offset-2 ${stateClass} ${className}`
  }, [disabled, isDragging, className])

  const openPicker = () => {
    if (disabled) return
    inputRef.current?.click()
  }

  const handleFiles = (fileList) => {
    if (disabled) return
    const files = Array.from(fileList || [])
    if (files.length === 0) return
    onFiles?.(files)
  }

  const onDragOver = (e) => {
    if (disabled) return
    e.preventDefault()
    setIsDragging(true)
  }

  const onDragLeave = (e) => {
    if (disabled) return
    e.preventDefault()
    setIsDragging(false)
  }

  const onDrop = (e) => {
    if (disabled) return
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div>
      {label ? <div className="label">{label}</div> : null}
      <button
        type="button"
        onClick={openPicker}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        disabled={disabled}
        className={baseClass}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-trae-100 text-trae-700">
          <Upload className="h-6 w-6" />
        </div>
        <div className="text-sm font-medium text-slate-900">Drag &amp; drop or click to upload</div>
        {hint ? <div className="text-xs text-slate-500">{hint}</div> : null}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />
    </div>
  )
}

export default Dropzone
