
import { toast } from "sonner";

// Function to generate a shareable link
export const generateShareableLink = (quizId: string): string => {
  return `${window.location.origin}/shared/${quizId}`;
};

// Function to copy quiz link to clipboard
export const copyQuizLinkToClipboard = (quizId: string): Promise<void> => {
  const shareableLink = generateShareableLink(quizId);
  
  return navigator.clipboard.writeText(shareableLink)
    .then(() => {
      toast.success("测验链接已复制！快分享给你的朋友吧。");
    })
    .catch((error) => {
      console.error("Failed to copy link:", error);
      toast.error("无法复制链接");
    });
};
