"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, X, CheckCircle, AlertCircle } from "lucide-react"
import { uploadToIPFS, formatFileSize, isAllowedFileType, isValidFileSize } from "@/lib/ipfs"

interface IPFSUploadProps {
  onUploadComplete?: (hashes: string[]) => void
  maxFiles?: number
}

export function IPFSUpload({ onUploadComplete, maxFiles = 5 }: IPFSUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedHashes, setUploadedHashes] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(e.target.files || [])
    setError(null)
    setSuccess(false)

    // Validate files
    const validFiles = selectedFiles.filter((file) => {
      if (!isAllowedFileType(file)) {
        setError(`File ${file.name} is not an allowed type`)
        return false
      }
      if (!isValidFileSize(file)) {
        setError(`File ${file.name} exceeds 10MB limit`)
        return false
      }
      return true
    })

    if (files.length + validFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`)
      return
    }

    setFiles([...files, ...validFiles])
  }

  function removeFile(index: number) {
    setFiles(files.filter((_, i) => i !== index))
  }

  async function handleUpload() {
    if (files.length === 0) {
      setError("Please select files to upload")
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const results = await uploadToIPFS(files)
      const hashes = results.map((r) => r.hash)

      setUploadedHashes(hashes)
      setSuccess(true)
      setFiles([])

      if (onUploadComplete) {
        onUploadComplete(hashes)
      }
    } catch (error: any) {
      console.error("[v0] Upload error:", error)
      setError("Failed to upload files to IPFS. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-emerald-50 border-emerald-200">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <AlertDescription className="text-emerald-900">
            Successfully uploaded {uploadedHashes.length} file(s) to IPFS
          </AlertDescription>
        </Alert>
      )}

      <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
        <input
          id="ipfs-upload"
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          onChange={handleFileSelect}
          disabled={isUploading}
          className="hidden"
        />
        <label htmlFor="ipfs-upload" className="cursor-pointer">
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium mb-1">Click to upload documents</p>
          <p className="text-xs text-muted-foreground">PDF, JPG, PNG, DOC (Max 10MB per file)</p>
        </label>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">{files.length} file(s) selected:</p>
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3 flex-1">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(index)} disabled={isUploading}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button onClick={handleUpload} disabled={isUploading} className="w-full">
            {isUploading ? "Uploading to IPFS..." : "Upload to IPFS"}
          </Button>
        </div>
      )}

      {uploadedHashes.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">IPFS Hashes:</p>
          {uploadedHashes.map((hash, index) => (
            <div key={index} className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <code className="text-xs font-mono break-all text-emerald-900">{hash}</code>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
