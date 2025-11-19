import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  acceptedFormats?: string;
  maxSizeMB?: number;
}

export const FileUpload = ({ 
  onFileSelect, 
  acceptedFormats = ".pdf", 
  maxSizeMB = 5 
}: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");

  const handleFile = (file: File) => {
    setError("");
    
    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Check file extension
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!acceptedFormats.includes(fileExtension)) {
      setError(`Please upload a valid file format: ${acceptedFormats}`);
      return;
    }

    // For PDF files, also validate MIME type for better security
    if (acceptedFormats.includes(".pdf") && fileExtension === ".pdf") {
      if (file.type !== "application/pdf") {
        setError("Please upload a valid PDF file");
        return;
      }
    }

    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer",
          dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary",
          error ? "border-destructive" : ""
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById("file-upload")?.click()}
      >
        <input
          id="file-upload"
          type="file"
          className="hidden"
          accept={acceptedFormats}
          onChange={handleChange}
        />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        {selectedFile ? (
          <div>
            <p className="text-lg font-semibold text-foreground mb-1">{selectedFile.name}</p>
            <p className="text-sm text-muted-foreground">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <p className="text-sm text-success mt-2">✓ File uploaded successfully</p>
          </div>
        ) : (
          <div>
            <p className="text-lg font-semibold text-foreground mb-2">
              Drag and drop your CV here
            </p>
            <p className="text-sm text-muted-foreground">or click to browse</p>
          </div>
        )}
      </div>
      {!selectedFile && (
        <div className="mt-3 text-center">
          <p className="text-xs text-muted-foreground">
            Accepted formats: {acceptedFormats.toUpperCase()} • Max size: {maxSizeMB}MB
          </p>
        </div>
      )}
      {error && (
        <p className="mt-2 text-sm text-destructive text-center">{error}</p>
      )}
    </div>
  );
};
