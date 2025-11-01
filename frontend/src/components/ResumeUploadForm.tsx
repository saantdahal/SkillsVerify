import React, { useState, useRef, ChangeEvent, DragEvent } from "react";
import { Upload, CheckCircle, X, File, FileText, Loader } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface VerificationResponse {
  github_username: string;
  resume_skills: string[];
  github_skills: string[];
  verification_result: {
    verified_skills: string[];
    unverified_skills: string[];
    additional_skills: string[];
    verification_percentage: number;
    explanation: string;
  };
  hash: string;
  verification_id: number;
}

const ResumeUploadForm: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  const handleFile = (selectedFile: File | null) => {
    setError("");

    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setError("Please upload PDF files only");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size should be less than 5MB");
      return;
    }

    setFile(selectedFile);
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setFile(null);
  };

  const handleSubmit = async () => {
    if (!file) return;

    try {
      setIsSubmitting(true);
      
      const formData = new FormData();
      formData.append('resume_pdf', file);
      formData.append('github_username', 'sacarsacar'); // Default value as requested
      
      const response = await axios.post<VerificationResponse>(
        'http://127.0.0.1:8000/api/verify-skills/',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      // Log the response to console
      console.log('API Response:', response.data);
      
      setIsSubmitting(false);
      
      // Redirect to verification report page
      if (response.data && response.data.verification_id) {
        navigate(`/verification/${response.data.verification_id}`);
      }
    } catch (err) {
      setIsSubmitting(false);
      if (axios.isAxiosError(err)) {
        console.error('API Error:', err.response?.data || err.message);
        setError(`Upload failed: ${err.response?.data?.message || err.message}`);
      } else {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">
      <div className="w-full max-w-lg bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-800 p-8">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-500/20 p-4 rounded-full">
              <FileText className="w-10 h-10 text-blue-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-3">
            Upload Your Resume
          </h1>
          <p className="text-gray-400">
            Upload your resume to get started with your application
          </p>
        </div>

        <div
          className={`relative border-2 border-dashed rounded-xl p-8 transition-all ${
            dragActive
              ? "border-blue-500 bg-blue-900/20"
              : "border-gray-700 hover:border-blue-400"
          } ${file ? "bg-blue-900/10" : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="application/pdf"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleFile(e.target.files?.[0] || null)
            }
          />

          {!file ? (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="bg-blue-500/20 p-4 rounded-full mb-4 group-hover:bg-blue-500/30">
                <Upload className="w-8 h-8 text-blue-400" />
              </div>
              <p className="text-center mb-2 font-medium text-lg">
                Drag & drop your resume here
              </p>
              <p className="text-center text-gray-400 text-sm mb-6">
                Support PDF files only (max 5MB)
              </p>
              <button
                onClick={onButtonClick}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-8 rounded-lg transition-all shadow-md shadow-blue-500/20 hover:shadow-blue-500/40"
              >
                Select File
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-blue-900/30 p-4 rounded-lg border border-blue-500/30">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <File className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="font-medium truncate max-w-xs">{file.name}</p>
                  <p className="text-gray-400 text-sm">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={removeFile}
                className="p-2 hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 text-red-500 text-sm flex items-center bg-red-500/10 p-3 rounded-lg border border-red-500/20">
            <X className="w-4 h-4 mr-2" />
            {error}
          </div>
        )}

        <div className="mt-8">
          <button
            onClick={handleSubmit}
            disabled={!file || isSubmitting}
            className={`w-full py-3 rounded-lg font-medium transition-all ${
              file && !isSubmitting
                ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/30"
                : "bg-gray-800 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </div>
            ) : file ? (
              <div className="flex items-center justify-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Submit Resume
              </div>
            ) : (
              "Upload Resume to Continue"
            )}
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            By uploading, you agree to our{" "}
            <span className="text-blue-400 hover:text-blue-300 cursor-pointer transition-colors">
              Terms of Service
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResumeUploadForm;