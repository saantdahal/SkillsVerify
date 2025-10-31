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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ContentData } from "@/pages/UploadPage";

interface ContentDetailsFormProps {
  contentData: ContentData;
  setContentData: React.Dispatch<React.SetStateAction<ContentData>>;
  onBack: () => void;
  onNext: () => void;
}

const ContentDetailsForm: React.FC<ContentDetailsFormProps> = ({
  contentData,
  setContentData,
  onBack,
  onNext,
}) => {
  const getPlaceholder = () => {
    switch (contentData.type) {
      case "course":
        return "e.g., Complete Web3 Development Bootcamp";
      case "practice-test":
        return "e.g., Blockchain Certification Practice Test";
      case "resources":
        return "e.g., Solidity Programming Notes";
      case "tutorial":
        return "e.g., Smart Contract Development Tutorial";
      default:
        return "Enter a title for your content";
    }
  };

  // const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files && e.target.files[0]) {
  //     setContentData({
  //       ...contentData,
  //       thumbnail: e.target.files[0],
  //     });
  //   }
  // };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">
          Tell us about your {contentData.type}
        </CardTitle>
        <CardDescription>
          Add a title and summary to help learners understand what they'll gain
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder={getPlaceholder()}
            value={contentData.title}
            onChange={(e) =>
              setContentData({
                ...contentData,
                title: e.target.value,
              })
            }
            required
          />
          <p className="text-xs text-muted-foreground">
            Your title should be clear, specific, and memorable
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="summary">Summary</Label>
          <Textarea
            id="summary"
            placeholder="Describe what learners will gain from your content"
            rows={5}
            value={contentData.summary}
            onChange={(e) =>
              setContentData({
                ...contentData,
                summary: e.target.value,
              })
            }
            required
          />
          <p className="text-xs text-muted-foreground">
            A good summary highlights the key benefits and outcomes for learners
          </p>
        </div>

        {/* <div className="space-y-2">
          <Label htmlFor="thumbnail">Thumbnail Image</Label>
          <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center">
            <ImageIcon className="h-10 w-10 text-slate-400 mb-2" />
            <p className="text-sm text-slate-500 mb-2">
              Drag and drop an image, or click to browse
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById("thumbnail")?.click()}
            >
              Upload Image
            </Button>
            <input
              type="file"
              id="thumbnail"
              className="hidden"
              accept="image/*"
              onChange={handleThumbnailChange}
            />
            <p className="text-xs text-slate-400 mt-4">
              Recommended size: 1280x720 pixels (16:9 ratio)
            </p>
          </div>
        </div> */}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>Continue</Button>
      </CardFooter>
    </Card>
  );
};

export default ContentDetailsForm;
