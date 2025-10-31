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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { BookOpen } from "lucide-react";

interface CategorySelectorProps {
  category: string;
  setCategory: (category: string) => void;
  onBack: () => void;
  onNext: () => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  category,
  setCategory,
  onBack,
  onNext,
}) => {
  const categories = [
    {
      id: "Design",
      name: "Design",
      description: "Figma, Photoshop, Illustrator, Blender etc.",
    },
    {
      id: "Engineering",
      name: "Engineering",
      description: "Civil, computer, mechanical, electrical, etc.",
    },
    {
      id: "LifeStyle",
      name: "Lifestyle",
      description: "Beauty, Fashion, Cooking, Fitness, etc.",
    },
    {
      id: "Self-Empowerment",
      name: "Self-Empowerment",
      description: "Yoga, Meditation, Mindfulness, etc.",
    },
    {
      id: "Management",
      name: "Marketing",
      description: "Seo, Social Media, Content Marketing, etc.",
    },
    {
      id: "Languages",
      name: "Languages",
      description: "English, Nepali, Spanish, French, etc.",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Choose a category</CardTitle>
        <CardDescription>
          Select the category that best fits your content
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={category}
          onValueChange={setCategory}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {categories.map((cat) => (
            <div key={cat.id}>
              <RadioGroupItem
                value={cat.id}
                id={cat.id}
                className="peer sr-only"
              />
              <Label
                htmlFor={cat.id}
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <div className="mb-2 rounded-full bg-primary/10 p-2">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-medium">{cat.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {cat.description}
                  </p>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
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

export default CategorySelector;
