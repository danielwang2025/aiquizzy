
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

// Get posts
export const getPosts = (): Post[] => {
  // Return sample posts
  return [
    {
      id: uuidv4(),
      title: "Welcome to the STEM News Forum",
      content: "This is a place to read the latest STEM news and share your thoughts in the comments.",
      author: "Admin",
      authorRole: UserRole.ADMIN,
      timestamp: Date.now(),
      likes: 0,
      comments: [],
      type: PostType.NEWS,
    }
  ];
};

export const savePosts = () => {
  console.log("Post save functionality is disabled to conserve resources");
};

export const addPost = (title: string, content: string, type: PostType): Post => {
  return {
    id: uuidv4(),
    title,
    content,
    author: "User",
    authorRole: UserRole.USER,
    timestamp: Date.now(),
    likes: 0,
    comments: [],
    type,
  };
};

export const addComment = (postId: string, content: string): Comment => {
  return {
    id: uuidv4(),
    content,
    author: "User",
    timestamp: Date.now(),
  };
};

export const likePost = (postId: string): number => {
  return 1;
};

export const getCurrentUser = () => {
  return {
    username: "User",
    role: UserRole.USER
  };
};

export const setUserRole = (role: UserRole) => {
  return {
    username: "User",
    role
  };
};

export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
};
