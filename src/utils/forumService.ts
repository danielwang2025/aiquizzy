
import { v4 as uuidv4 } from 'uuid';

// Post types
export enum PostType {
  NEWS = 'news',
  REGULAR = 'regular'
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

// Define post interface
export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  authorRole: UserRole;
  timestamp: number;
  likes: number;
  comments: Comment[];
  type: PostType;
}

export interface Comment {
  id: string;
  content: string;
  author: string;
  timestamp: number;
}

// localStorage keys
const FORUM_POSTS_KEY = 'forumPosts';
const CURRENT_USER_KEY = 'currentForumUser';

// Default admin user
const DEFAULT_ADMIN = {
  username: 'Admin',
  role: UserRole.ADMIN
};

// Get posts from localStorage
export const getPosts = (): Post[] => {
  const storedPosts = localStorage.getItem(FORUM_POSTS_KEY);
  if (storedPosts) {
    return JSON.parse(storedPosts);
  }
  
  // Sample posts if none exist
  const samplePosts: Post[] = [
    {
      id: uuidv4(),
      title: "Welcome to the STEM News Forum",
      content: "This is a place to read the latest STEM news and share your thoughts in the comments.",
      author: "Admin",
      authorRole: UserRole.ADMIN,
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
      type: PostType.NEWS,
    },
    {
      id: uuidv4(),
      title: "New Math Curriculum Announced",
      content: "A new math curriculum focused on applied mathematics and real-world problem solving will be implemented next semester.",
      author: "Admin",
      authorRole: UserRole.ADMIN,
      timestamp: Date.now() - 172800000,
      likes: 8,
      comments: [],
      type: PostType.NEWS,
    },
  ];
  
  localStorage.setItem(FORUM_POSTS_KEY, JSON.stringify(samplePosts));
  return samplePosts;
};

// Save posts to localStorage
export const savePosts = (posts: Post[]) => {
  localStorage.setItem(FORUM_POSTS_KEY, JSON.stringify(posts));
};

// Add a new post
export const addPost = (title: string, content: string, type: PostType): Post => {
  const currentUser = getCurrentUser();
  
  const newPost: Post = {
    id: uuidv4(),
    title,
    content,
    author: currentUser.username,
    authorRole: currentUser.role,
    timestamp: Date.now(),
    likes: 0,
    comments: [],
    type,
  };
  
  const posts = getPosts();
  const updatedPosts = [newPost, ...posts];
  savePosts(updatedPosts);
  
  return newPost;
};

// Add a comment to a post
export const addComment = (postId: string, content: string): Comment => {
  const currentUser = getCurrentUser();
  
  const newComment: Comment = {
    id: uuidv4(),
    content,
    author: currentUser.username,
    timestamp: Date.now(),
  };
  
  const posts = getPosts();
  const updatedPosts = posts.map(post => 
    post.id === postId 
      ? { ...post, comments: [...post.comments, newComment] } 
      : post
  );
  
  savePosts(updatedPosts);
  return newComment;
};

// Like a post
export const likePost = (postId: string): number => {
  const posts = getPosts();
  const updatedPosts = posts.map(post => 
    post.id === postId ? { ...post, likes: post.likes + 1 } : post
  );
  
  savePosts(updatedPosts);
  const updatedPost = updatedPosts.find(post => post.id === postId);
  return updatedPost?.likes || 0;
};

// Get current user or set default if none
export const getCurrentUser = () => {
  const storedUser = localStorage.getItem(CURRENT_USER_KEY);
  if (storedUser) {
    return JSON.parse(storedUser);
  }
  
  // Use default admin
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(DEFAULT_ADMIN));
  return DEFAULT_ADMIN;
};

// Set the current user role (for demo purposes)
export const setUserRole = (role: UserRole) => {
  const currentUser = getCurrentUser();
  const updatedUser = {
    ...currentUser,
    role
  };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
  return updatedUser;
};

// Format date helper
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
};
