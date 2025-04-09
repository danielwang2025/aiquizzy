
import React from "react";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Github, Twitter, Facebook, Mail, Heart } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-16 px-6 bg-gradient-to-b from-background to-secondary/30 border-t text-sm">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">

          {/* Brand Section */}
          <div>
            <h3 className="font-extrabold text-2xl mb-4 gradient-text">AI Quizzy</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              先进的AI测验生成平台，适用于教育和专业发展。
            </p>
            <div className="flex space-x-3">
              {[{ icon: Twitter, href: "https://twitter.com", label: "Twitter" },
                { icon: Github, href: "https://github.com", label: "GitHub" },
                { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
              ].map(({ icon: Icon, href, label }, idx) => (
                <a
                  key={idx}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-secondary hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary"
                >
                  <Icon size={18} />
                </a>
              ))}
              <Link
                to="/contact"
                aria-label="Contact Us"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-secondary hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary"
              >
                <Mail size={18} />
              </Link>
            </div>
          </div>

          {/* Navigation Columns */}
          {[
            {
              title: "平台",
              links: [
                { to: "/", label: "首页" },
                { to: "/customize", label: "创建测验" },
                { to: "/review", label: "复习中心" },
                { to: "/pricing", label: "价格方案" },
              ],
            },
            {
              title: "资源",
              links: [
                { to: "/dashboard", label: "个人中心" },
                { to: "/profile", label: "用户资料" },
                { href: "#", label: "博客" },
                { href: "#", label: "帮助中心" },
              ],
            },
            {
              title: "法律条款",
              links: [
                { to: "/terms", label: "服务条款" },
                { to: "/privacy", label: "隐私政策" },
                { href: "#", label: "Cookie政策" },
                { to: "/contact", label: "联系我们" },
              ],
            },
          ].map((section, idx) => (
            <div key={idx}>
              <h4 className="font-semibold text-lg mb-4 gradient-text">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map(({ to, href, label }, i) =>
                  to ? (
                    <li key={i}>
                      <Link
                        to={to}
                        className="text-muted-foreground hover:text-primary transition-colors inline-block"
                      >
                        {label}
                      </Link>
                    </li>
                  ) : (
                    <li key={i}>
                      <a
                        href={href}
                        className="text-muted-foreground hover:text-primary transition-colors inline-block"
                      >
                        {label}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-12" />

        <div className="flex flex-col md:flex-row items-center justify-between">
          <p className="text-muted-foreground flex items-center">
            © {currentYear} AI Quizzy. 保留所有权利。由我们的团队用
            <Heart className="h-4 w-4 mx-1 text-red-500" /> 创建。
          </p>
          <div className="flex gap-6 mt-6 md:mt-0">
            <Link to="/terms" className="hover:text-primary transition-colors">
              条款
            </Link>
            <Link to="/privacy" className="hover:text-primary transition-colors">
              隐私
            </Link>
            <a href="#" className="hover:text-primary transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
