
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { MessageCircle, ThumbsUp, MessageSquare, Clock, User } from "lucide-react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

// Define post schema
const postSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  content: z.string().min(10, { message: "Content must be at least 10 characters." }),
});

// Define post type
interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  timestamp: number;
  likes: number;
  comments: Comment[];
}

interface Comment {
  id: string;
  content: string;
  author: string;
  timestamp: number;
}

const Forum: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof postSchema>>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  // Load posts from localStorage on component mount
  useEffect(() => {
    const storedPosts = localStorage.getItem("forumPosts");
    if (storedPosts) {
      setPosts(JSON.parse(storedPosts));
    } else {
      // Add sample posts if none exist
      const samplePosts: Post[] = [
        {
          id: uuidv4(),
          title: "Welcome to the STEM Forum",
          content: "This is a place to discuss STEM topics, ask questions, and share knowledge.",
          author: "Admin",
          timestamp: Date.now(),
          likes: 5,
          comments: [
            {
              id: uuidv4(),
              content: "Great to have this forum!",
              author: "User1",
              timestamp: Date.now() - 3600000,
            },
          ],
        },
        {
          id: uuidv4(),
          title: "How to solve quadratic equations?",
          content: "I'm struggling with solving quadratic equations. Can someone provide step-by-step guidance?",
          author: "MathStudent",
          timestamp: Date.now() - 86400000,
          likes: 3,
          comments: [],
        },
      ];
      setPosts(samplePosts);
      localStorage.setItem("forumPosts", JSON.stringify(samplePosts));
    }
    setIsLoading(false);
  }, []);

  // Save posts to localStorage whenever posts change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("forumPosts", JSON.stringify(posts));
    }
  }, [posts, isLoading]);

  const onSubmit = (values: z.infer<typeof postSchema>) => {
    const newPost: Post = {
      id: uuidv4(),
      title: values.title,
      content: values.content,
      author: "You", // In a real app, this would be the current user
      timestamp: Date.now(),
      likes: 0,
      comments: [],
    };

    setPosts([newPost, ...posts]);
    form.reset();
    toast.success("Post created successfully");
  };

  const handleLike = (postId: string) => {
    setPosts(
      posts.map((post) => 
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );
  };

  const handleAddComment = (postId: string, commentContent: string) => {
    if (!commentContent.trim()) return;
    
    const newComment: Comment = {
      id: uuidv4(),
      content: commentContent,
      author: "You", // In a real app, this would be the current user
      timestamp: Date.now(),
    };

    setPosts(
      posts.map((post) => 
        post.id === postId 
          ? { ...post, comments: [...post.comments, newComment] } 
          : post
      )
    );
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <span className="px-4 py-1.5 text-sm font-medium bg-blue-100 text-blue-700 rounded-full inline-block mb-4">
          Community Forum
        </span>
        <h1 className="text-4xl font-bold mb-4 tracking-tight gradient-text">
          STEM Discussion Forum
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Share ideas, ask questions, and connect with other STEM enthusiasts
        </p>

        {/* Create new post form */}
        <Card className="p-6 mb-8 border shadow-sm">
          <h2 className="text-xl font-bold mb-4">Create a New Post</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Post title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Write your post content here..." 
                        className="min-h-[120px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full sm:w-auto">
                <MessageCircle className="mr-2 h-4 w-4" />
                Create Post
              </Button>
            </form>
          </Form>
        </Card>

        {/* Posts list */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-8">Loading posts...</div>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <ForumPost 
                key={post.id} 
                post={post} 
                onLike={handleLike} 
                onAddComment={handleAddComment} 
              />
            ))
          ) : (
            <div className="text-center py-8">No posts yet. Be the first to post!</div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

interface ForumPostProps {
  post: Post;
  onLike: (postId: string) => void;
  onAddComment: (postId: string, comment: string) => void;
}

const ForumPost: React.FC<ForumPostProps> = ({ post, onLike, onAddComment }) => {
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <Card className="p-6 border shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-bold mb-2">{post.title}</h3>
        <p className="text-muted-foreground text-sm mb-3 flex items-center gap-1">
          <User className="h-4 w-4" /> {post.author} • <Clock className="h-4 w-4" /> {formatDate(post.timestamp)}
        </p>
        <p className="mb-4">{post.content}</p>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onLike(post.id)}
            className="flex items-center gap-1"
          >
            <ThumbsUp className="h-4 w-4" /> {post.likes}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1"
          >
            <MessageSquare className="h-4 w-4" /> {post.comments.length} Comments
          </Button>
        </div>
      </div>

      {showComments && (
        <div className="mt-4 border-t pt-4">
          <h4 className="font-medium mb-3">Comments</h4>
          
          <div className="space-y-3 mb-4">
            {post.comments.length > 0 ? (
              post.comments.map((comment) => (
                <div key={comment.id} className="bg-secondary/50 p-3 rounded-md">
                  <p className="text-sm">{comment.content}</p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <User className="h-3 w-3" /> {comment.author} • <Clock className="h-3 w-3" /> {formatDate(comment.timestamp)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No comments yet.</p>
            )}
          </div>
          
          <div className="flex gap-2 mt-3">
            <Textarea 
              placeholder="Write a comment..." 
              value={commentText} 
              onChange={(e) => setCommentText(e.target.value)}
              className="text-sm min-h-[60px]"
            />
            <Button 
              size="sm" 
              onClick={() => {
                onAddComment(post.id, commentText);
                setCommentText("");
              }}
              disabled={!commentText.trim()}
            >
              Post
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default Forum;
