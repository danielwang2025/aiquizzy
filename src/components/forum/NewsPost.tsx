
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  MessageSquare, 
  ThumbsUp, 
  Send,
  User, 
  Clock,
  Shield
} from "lucide-react";
import {
  Comment,
  Post,
  formatDate,
  addComment,
  likePost
} from "@/utils/forumService";

interface NewsPostProps {
  post: Post;
  onUpdate: () => void;
}

const NewsPost: React.FC<NewsPostProps> = ({ post, onUpdate }) => {
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);

  const handleLike = () => {
    likePost(post.id);
    onUpdate();
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    
    addComment(post.id, commentText);
    setCommentText("");
    onUpdate();
  };

  return (
    <Card className="p-6 border border-blue-200 shadow-sm bg-blue-50/50 dark:bg-blue-950/20">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-xl font-bold">{post.title}</h3>
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full dark:bg-blue-900 dark:text-blue-200">
            News
          </span>
        </div>
        
        <p className="text-muted-foreground text-sm mb-3 flex items-center gap-1">
          <Shield className="h-4 w-4 text-blue-500" /> {post.author} • <Clock className="h-4 w-4" /> {formatDate(post.timestamp)}
        </p>
        
        <p className="mb-4 text-base leading-relaxed">{post.content}</p>
        
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLike}
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
                <div key={comment.id} className="bg-background p-3 rounded-md shadow-sm">
                  <p className="text-sm">{comment.content}</p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <User className="h-3 w-3" /> {comment.author} • <Clock className="h-3 w-3" /> {formatDate(comment.timestamp)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No comments yet. Be the first to comment!</p>
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
              className="flex-shrink-0"
              onClick={handleAddComment}
              disabled={!commentText.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default NewsPost;
