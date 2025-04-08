
import React from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          
          <div className="prose prose-slate max-w-none">
            <p className="text-lg text-muted-foreground mb-8">
              Last Updated: April 8, 2025
            </p>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p className="mb-4">
                AI Quizzy ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
              </p>
              <p className="mb-4">
                Please read this Privacy Policy carefully. By accessing or using our services, you acknowledge that you have read, understood, and agree to be bound by all the terms of this Privacy Policy.
              </p>
            </section>
            
            <Separator className="my-6" />
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
              <p className="mb-4">
                We may collect several types of information from and about users of our services, including:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Personal identifiers such as name and email address when you register for an account</li>
                <li>Billing information when you subscribe to our premium services</li>
                <li>Content data such as quiz questions, answers, and related materials you create using our services</li>
                <li>Usage data including how you interact with our services</li>
                <li>Device information such as IP address, browser type, and operating system</li>
              </ul>
            </section>
            
            <Separator className="my-6" />
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              <p className="mb-4">
                We may use the information we collect from you for various purposes, including:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Providing, maintaining, and improving our services</li>
                <li>Processing your subscriptions and payments</li>
                <li>Sending you important notices and updates</li>
                <li>Responding to your comments, questions, and requests</li>
                <li>Monitoring and analyzing trends, usage, and activities in connection with our services</li>
                <li>Detecting, preventing, and addressing technical issues</li>
              </ul>
            </section>
            
            <Separator className="my-6" />
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. How We Share Your Information</h2>
              <p className="mb-4">
                We may share your information in the following situations:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>With service providers who perform services on our behalf</li>
                <li>To comply with legal obligations</li>
                <li>To protect and defend our rights and property</li>
                <li>With your consent or at your direction</li>
              </ul>
              <p className="mb-4">
                We do not sell your personal information to third parties.
              </p>
            </section>
            
            <Separator className="my-6" />
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
              <p className="mb-4">
                We implement appropriate security measures to protect your personal information. However, please be aware that no method of transmission over the Internet or method of electronic storage is 100% secure.
              </p>
            </section>
            
            <Separator className="my-6" />
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Your Data Protection Rights</h2>
              <p className="mb-4">
                Depending on your location, you may have certain rights regarding your personal information, such as:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>The right to access the personal information we hold about you</li>
                <li>The right to request correction of inaccurate personal information</li>
                <li>The right to request deletion of your personal information</li>
                <li>The right to restrict or object to processing of your personal information</li>
                <li>The right to data portability</li>
              </ul>
              <p className="mb-4">
                To exercise these rights, please contact us using the information provided at the end of this Privacy Policy.
              </p>
            </section>
            
            <Separator className="my-6" />
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Cookies and Tracking Technologies</h2>
              <p className="mb-4">
                We use cookies and similar tracking technologies to track activity on our services and hold certain information. Cookies are files with a small amount of data that may include an anonymous unique identifier.
              </p>
              <p className="mb-4">
                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our services.
              </p>
            </section>
            
            <Separator className="my-6" />
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Children's Privacy</h2>
              <p className="mb-4">
                Our services are not intended for use by children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us.
              </p>
            </section>
            
            <Separator className="my-6" />
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Changes to This Privacy Policy</h2>
              <p className="mb-4">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
              </p>
              <p className="mb-4">
                You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
              </p>
            </section>
            
            <Separator className="my-6" />
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please <Link to="/contact" className="text-primary hover:underline">contact us</Link>.
              </p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Privacy;
