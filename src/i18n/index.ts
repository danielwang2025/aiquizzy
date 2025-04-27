
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          nav: {
            home: 'Home',
            createQuiz: 'Create STEM Quiz',
            game: 'Game',
            dashboard: 'Dashboard',
            review: 'Review',
            contact: 'Contact'
          },
          header: {
            title: 'STEM AI Quizzy',
            aiLearning: 'AI-Powered Learning',
            masterSubject: 'Master Any Subject with AI-Generated Practice Questions',
            description: 'Enter your study topic and instantly get customized practice questions that adapt to your learning style',
            startPractice: 'Start Practice',
            inputPlaceholder: 'E.g., React basics, JavaScript ES6 syntax...'
          },
          features: {
            instantGen: 'Instant Generation',
            aiExplanations: 'AI Explanations',
            personalizedLearning: 'Personalized Learning'
          }
        }
      },
      zh: {
        translation: {
          nav: {
            home: '首页',
            createQuiz: '创建STEM测验',
            game: '游戏',
            dashboard: '仪表盘',
            review: '复习',
            contact: '联系我们'
          },
          header: {
            title: 'STEM AI 智能测验',
            aiLearning: 'AI驱动学习',
            masterSubject: '通过AI生成的练习题掌握任何学科',
            description: '输入你的学习主题，立即获取适应你学习风格的个性化练习题',
            startPractice: '开始练习',
            inputPlaceholder: '例如：React基础, JavaScript ES6语法...'
          },
          features: {
            instantGen: '即时生成',
            aiExplanations: 'AI解释',
            personalizedLearning: '个性化学习'
          }
        }
      }
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
