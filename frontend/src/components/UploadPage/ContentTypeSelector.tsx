import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, ClipboardList, Video, Lightbulb } from "lucide-react";

interface ContentTypeSelectorProps {
  onSelect: (type: string) => void;
}

const ContentTypeSelector: React.FC<ContentTypeSelectorProps> = ({
  onSelect,
}) => {
  const contentTypes = [
    {
      id: "resources",
      name: "Resources / Notes",
      icon: FileText,
      description:
        "Share study materials, notes, and reference documents to help others learn.",
    },
    {
      id: "practice-test",
      name: "Practice Test",
      icon: ClipboardList,
      description:
        "Help students prepare for certification exams by providing practice questions.",
    },
    {
      id: "course",
      name: "Course",
      icon: Video,
      description:
        "Create rich learning experiences with the help of video lectures, coding exercises, exercises, etc.",
    },
    {
      id: "tutorial",
      name: "Tutorial",
      icon: Lightbulb,
      description:
        "Create step-by-step guides to teach specific skills or concepts.",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-center">
        First, let's find out what type of content you're making.
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {contentTypes.map((type) => (
          <Card
            key={type.id}
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => onSelect(type.id)}
          >
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <type.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">{type.name}</h3>
              <p className="text-muted-foreground">{type.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ContentTypeSelector;
