import { useState } from "react";
import {
  Image,
  FileText,
  Video,
  X,
  Upload,
  ImageIcon,
  PaperclipIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useEnokiFlow } from "@mysten/enoki/react";

const WALRUS_PUBLISHER_URL = import.meta.env.VITE_APP_WALRUS_PUBLISHER_URL;

const UploadPanel = () => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState("");
  const [imageFileb64, setImageFileb64] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fileSizeError, setFileSizeError] = useState(false);
  const flow = useEnokiFlow();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];

      if (selectedFile.size > 1024 * 1024) {
        setFileSizeError(true);
        setFile(null);
        return;
      }

      // Convert image file into base64
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        setImageFileb64(base64String);
      };
      reader.readAsDataURL(selectedFile);

      setFileSizeError(false);
      setFile(selectedFile);
      const imgFile =
        selectedFile?.type === "image/png" ||
        selectedFile?.type === "image/jpeg"
          ? URL.createObjectURL(selectedFile)
          : "";
      setImageFile(imgFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !title || !body) {
      setErrorMessage(
        "Please fill in all required fields (title, body, and file)."
      );
      setTimeout(() => setErrorMessage(""), 5000);
      return;
    }

    setIsUploading(true);
    setIsSuccess(false);
    setErrorMessage("");

    try {
      const fileType = file.type;
      const storageInfo = await storeBlob(file, fileType);
      console.log("Blob ID:", storageInfo.blobId);
      setTitle("");
      setBody("");
      setFile(null);
      setIsSuccess(true);
    } catch (error) {
      console.error(error);
      setErrorMessage("An error occurred while uploading the file.");
    }

    setIsUploading(false);
  };

  const handleUploadClick = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleUpload();
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFileSizeError(false);
  };

  const handleAddSui = async () => {
    await AddSui(flow);
  };

  const storeBlob = async (file: File, fileType: string) => {
    const basePublisherUrl = WALRUS_PUBLISHER_URL;
    const numEpochs = "1";
    // const keypair = await flow.getKeypair();

    const response = await fetch(
      `${basePublisherUrl}/v1/blobs?epochs=${numEpochs}`,
      {
        method: "PUT",
        body: file,
      }
    );

    if (response.status === 200) {
      const info = await response.json();
      console.log(info);
      if ("alreadyCertified" in info) {
        // const blob = blobIdToU256(info.alreadyCertified.blobId);
        const blob = info.alreadyCertified.blobId;
        await UploadContent(title, body, blob, fileType, flow);

        return { blobId: info.alreadyCertified.blobId };
      } else if ("newlyCreated" in info) {
        // const blob = blobIdToU256(info.newlyCreated.blobObject.blobId);
        const blob = info.newlyCreated.blobObject.blobId;

        await UploadContent(title, body, blob, fileType, flow);

        return { blobId: info.newlyCreated.blobObject.blobId };
      } else {
        throw new Error("Unhandled successful response!");
      }
    } else {
      throw new Error("Something went wrong when storing the blob!");
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleUploadClick} className="space-y-2">
          <div className="flex items-center gap-3 mb-4">
            <Upload />
            <p className="font-medium">Upload Content</p>
          </div>

          <div className="flex flex-col">
            <span className="text-base font-semibold md:text-lg">Title</span>
            <input
              placeholder="Title..."
              className="h-12 w-[600px] rounded-lg border"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold md:text-lg">Body</span>
            <textarea
              placeholder="Describe..."
              className="min-h-24 w-[600px] rounded-lg border"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />
          </div>

          <label
            htmlFor="file-upload"
            className="flex w-[600px] cursor-pointer items-center justify-between rounded-2xl border px-4 py-2 font-semibold"
          >
            {file ? (
              <div className="flex items-center">
                <span>{file.name}</span>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="ml-4 rounded-xl bg-red-500"
                >
                  <X className="w-6" />
                </button>
              </div>
            ) : (
              <>
                <span>Add to your content</span>
                <div className="flex items-center gap-2 text-[#7C93C3]">
                  <ImageIcon className="w-8" />
                  <PaperclipIcon className="w-5" />
                </div>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept="image/png, image/jpeg, image/jpg, text/plain"
                  onChange={handleFileChange}
                  required
                />
              </>
            )}
          </label>

          {/* <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 text-gray-500"
                onClick={() => document.getElementById("image-upload")?.click()}
              >
                <Image className="h-4 w-4" />
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 text-gray-500"
              >
                <Video className="h-4 w-4" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 text-gray-500"
              >
                <FileText className="h-4 w-4" />
              </Button>
            </div>

            <Button type="submit" disabled={!title.trim()}>
              Post
            </Button>
          </div> */}
          <div className="flex justify-between items-center">
            <Button
              type="submit"
              className="mt-4"
              disabled={isUploading || !title.trim() || !body.trim() || !file}
            >
              {isUploading ? "Uploading..." : "Post"}
            </Button>
          </div>
        </form>
        <Button onClick={handleAddSui} className="flex items-end mt-4">
          Add Sui
        </Button>

        {errorMessage && (
          <p className="mt-2 text-sm text-red-500">{errorMessage}</p>
        )}

        {isSuccess && (
          <p className="mt-2 text-sm text-green-500">Upload successful!</p>
        )}
      </CardContent>
    </Card>
  );
};

export default UploadPanel;
