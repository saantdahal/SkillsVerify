import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Heart, MessageSquare, Share2 } from "lucide-react";
import { useLogin } from "@/context/UserContext";

interface Post {
  id: string;
  author: string;
  authorId: string;
  title: string;
  content: string;
  timestamp: string;
  imageUrl?: string;
  file_type: "text" | "image";
  likes: number;
}

interface ContentFeedProps {
  posts: Post[];
}

const ContentFeed = ({ posts }: ContentFeedProps) => {
  const { isLoggedIn } = useLogin();
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

  const handleLike = (postId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when liking
    if (!isLoggedIn) return;
    setLikedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleCardClick = (postId: string) => {
    navigate(`/post/${postId}`);
  };

  return (
    <div className="space-y-8">
      {posts.map((post) => (
        <Card
          key={post.id}
          className="overflow-hidden border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
          onClick={() => handleCardClick(post.id)}
        >
          <CardHeader className="p-6 pb-4">
            <Link
              to={`/profile/${post.authorId}`}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              onClick={(e) => e.stopPropagation()} // Prevent card click when clicking profile
            >
              <Avatar className="h-10 w-10 border-2 border-border">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {post.author.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-base">{post.author}</p>
                <p className="text-xs text-muted-foreground">
                  {post.timestamp}
                </p>
              </div>
            </Link>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <h2 className="text-xl font-semibold mb-3">{post.title}</h2>
            {post.content && (
              <p className="text-muted-foreground leading-relaxed">
                {post.content}
              </p>
            )}
            {post.imageUrl && (
              <div className="mt-4 rounded-lg overflow-hidden">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}
          </CardContent>
          <CardFooter className="p-6 pt-0 flex justify-between">
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center gap-2 ${
                isLoggedIn
                  ? "hover:text-primary"
                  : "cursor-not-allowed opacity-50"
              }`}
              onClick={(e) => handleLike(post.id, e)}
              disabled={!isLoggedIn}
            >
              <Heart
                className={`h-5 w-5 ${
                  likedPosts[post.id] ? "fill-primary text-primary" : ""
                }`}
              />
              <span>{post.likes}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center gap-2 ${
                isLoggedIn
                  ? "hover:text-primary"
                  : "cursor-not-allowed opacity-50"
              }`}
              disabled={!isLoggedIn}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/post/${post.id}#comments`);
              }}
            >
              <MessageSquare className="h-5 w-5" />
              <span>Comment</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 hover:text-primary"
              onClick={(e) => e.stopPropagation()} // Prevent card click when sharing
            >
              <Share2 className="h-5 w-5" />
              <span>Share</span>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default ContentFeed;
