import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import { Star, Users } from "lucide-react";

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    author: string;
    price: number;
    image: string;
    rating: number;
    students: number;
    category: string;
    completionPercentage?: number;
    earnings?: number;
    sales?: number;
  };
  variant?: "standard" | "created" | "purchased";
}

const CourseCard = ({ course, variant = "standard" }: CourseCardProps) => {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md dark:hover:shadow-purple-900/10 flex flex-col">
      <Link to={`/course/${course.id}`}>
        <div className="relative h-48 w-full">
          <img
            src={course.image || "/placeholder.svg"}
            alt={course.title}
            className="w-full h-full object-cover"
          />
          <Badge className="absolute top-2 right-2 bg-slate-800/80 dark:bg-slate-800/90 hover:bg-slate-800/80 text-gray-300 dark:hover:bg-slate-800/90">
            {course.category}
          </Badge>
        </div>
      </Link>

      <CardContent className="p-4 flex-grow flex flex-col">
        <div>
          <Link to={`/course/${course.id}`}>
            <h3 className="font-medium text-lg mb-1 line-clamp-2 hover:text-primary transition-colors">
              {course.title}
            </h3>
          </Link>
          <p className="text-sm text-muted-foreground mb-2">
            by {course.author}
          </p>

          {variant === "standard" && (
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
                <span>{course.rating.toFixed(1)}</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 text-slate-400 mr-1" />
                <span>{course.students}</span>
              </div>
            </div>
          )}

          {variant === "created" && course.sales !== undefined && (
            <div className="flex justify-between items-center mt-4">
              <div className="font-bold">{course.price} SUI</div>
              <div className="text-sm text-muted-foreground">
                {course.sales} sales
              </div>
            </div>
          )}

          {variant === "created" && course.earnings !== undefined && (
            <div className="mt-2 text-sm">
              <span className="font-medium">{course.earnings} SUI</span> earned
            </div>
          )}
        </div>

        {variant === "purchased" &&
          course.completionPercentage !== undefined && (
            <div className="mt-auto pt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{course.completionPercentage}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{
                    width: `${course.completionPercentage}%`,
                  }}
                ></div>
              </div>
            </div>
          )}
      </CardContent>

      {variant === "standard" && (
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <div className="font-bold">{course.price} SUI</div>
          <Badge variant="outline" className="font-mono">
            Buy
          </Badge>
        </CardFooter>
      )}
    </Card>
  );
};

export default CourseCard;
