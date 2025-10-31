import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, FileText, CheckCircle } from "lucide-react";
import { ContentData } from "@/pages/UploadPage";

interface ContentUploaderProps {
  contentData: ContentData;
  setContentData: React.Dispatch<React.SetStateAction<ContentData>>;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
  uploading: boolean;
}

const ContentUploader: React.FC<ContentUploaderProps> = ({
  contentData,
  setContentData,
  onBack,
  onSubmit,
  uploading,
}) => {
  const getContentTypePrompt = () => {
    switch (contentData.type) {
      case "course":
        return "videos, slides, and documents";
      case "practice-test":
        return "questions and answers";
      case "resources":
        return "notes, PDFs, and reference materials";
      case "tutorial":
        return "tutorial files and examples";
      default:
        return "files";
    }
  };

  const removeFile = (index: number) => {
    const updatedMaterials = [...contentData.materials];
    updatedMaterials.splice(index, 1);
    setContentData({
      ...contentData,
      materials: updatedMaterials,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setContentData({
        ...contentData,
        materials: [...contentData.materials, ...newFiles],
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Upload your content</CardTitle>
        <CardDescription>
          Add the materials that learners will use
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-8 flex flex-col items-center justify-center">
          <Upload className="h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-xl font-medium mb-2">Drag and drop files here</h3>
          <p className="text-sm text-slate-500 mb-4 text-center max-w-md">
            Upload your {getContentTypePrompt()}
          </p>
          <Button
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            Browse Files
          </Button>
          <input
            id="file-upload"
            type="file"
            multiple
            className="hidden"
            onChange={handleFileUpload}
          />
          <p className="text-xs text-slate-400 mt-4">
            Supported formats: TXT, PDF, MP4 (max 2GB per file)
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Uploaded Files</h3>
          <div className="space-y-2">
            {/* Display mock file for demonstration */}

            {/* Map through contentData.materials if needed */}
            {contentData.materials.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-3 rounded border"
              >
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-slate-400 mr-2" />
                  <span>{file.name}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-xs text-slate-500 mr-2">
                    {(file.size / 1024).toFixed(2)}KB
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => removeFile(index + 1)} // +1 because of the mock file
                  >
                    <span className="sr-only">Remove</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" onClick={onSubmit} disabled={uploading}>
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Publishing...
            </>
          ) : (
            "Publish Content"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ContentUploader;
