
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageCircle, 
  Shield 
} from "lucide-react";
import NewsPost from "@/components/forum/NewsPost";
import NewsForm from "@/components/forum/NewsForm";
import UserRoleSelector from "@/components/forum/UserRoleSelector";
import { 
  getPosts, 
  savePosts, 
  getCurrentUser, 
  PostType,
  UserRole 
} from "@/utils/forumService";

const Forum: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Load posts and current user on component mount
  useEffect(() => {
    const loadedPosts = getPosts();
    setPosts(loadedPosts);
    setCurrentUser(getCurrentUser());
    setIsLoading(false);
  }, []);

  // Update posts when they change
  const handleUpdate = () => {
    setPosts(getPosts());
    setCurrentUser(getCurrentUser());
  };

  // Filter posts by type
  const newsPosts = posts.filter(post => post.type === PostType.NEWS);
  
  // Check if user is admin
  const isAdmin = currentUser?.role === UserRole.ADMIN;

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <span className="px-4 py-1.5 text-sm font-medium bg-blue-100 text-blue-700 rounded-full inline-block mb-4">
          STEM News
        </span>
        <h1 className="text-4xl font-bold mb-4 tracking-tight gradient-text">
          STEM News Forum
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Stay updated with the latest STEM news and join the discussion
        </p>

        {/* User role selector for demo purposes */}
        <UserRoleSelector onRoleChange={handleUpdate} />

        {/* News posts form for admins */}
        {isAdmin && (
          <NewsForm onPostCreated={handleUpdate} />
        )}

        {/* Tabs for different post types */}
        <Tabs defaultValue="news" className="mb-8">
          <TabsList className="mb-6">
            <TabsTrigger value="news" className="flex items-center gap-2">
              <Shield className="h-4 w-4" /> News
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="news">
            {isLoading ? (
              <div className="text-center py-8">Loading posts...</div>
            ) : newsPosts.length > 0 ? (
              <div className="space-y-6">
                {newsPosts.map((post) => (
                  <NewsPost key={post.id} post={post} onUpdate={handleUpdate} />
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No news posts yet</h3>
                <p className="text-muted-foreground">
                  {isAdmin 
                    ? "Create your first news post using the form above."
                    : "The administrator will post news soon."}
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default Forum;
