
import React from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Separator } from "@/components/ui/separator";

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          
          <div className="prose prose-slate max-w-none">
            <p className="text-lg text-muted-foreground mb-8">
              Last Updated: April 8, 2025
            </p>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p className="mb-4">
                Welcome to AI Quizzy. These Terms of Service ("Terms") govern your use of our website, products, and services ("Services"). By accessing or using our Services, you agree to be bound by these Terms. If you disagree with any part of the Terms, you may not access the Service.
              </p>
            </section>
            
            <Separator className="my-6" />
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Use of the Service</h2>
              <p className="mb-4">
                Our Services allow you to generate quizzes using AI technology. You are responsible for your use of the Services and any content you provide, including compliance with applicable laws, rules, and regulations.
              </p>
              <p className="mb-4">
                You may not use the Services for any illegal or unauthorized purpose nor may you, in the use of the Service, violate any laws in your jurisdiction (including but not limited to copyright laws).
              </p>
            </section>
            
            <Separator className="my-6" />
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. Account Registration</h2>
              <p className="mb-4">
                To access certain features of our Services, you may be required to register for an account. When you register for an account, you must provide accurate and complete information and keep this information updated.
              </p>
              <p className="mb-4">
                You are responsible for safeguarding the password that you use to access the Services and for any activities or actions under your password. We encourage you to use a strong password (a combination of upper and lower case letters, numbers, and symbols) with your account.
              </p>
            </section>
            
            <Separator className="my-6" />
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Subscription and Payments</h2>
              <p className="mb-4">
                Some of our Services are available on a subscription basis. You will be billed in advance on a recurring basis, depending on the type of subscription plan you select. You may cancel your subscription at any time from your account settings.
              </p>
              <p className="mb-4">
                If you cancel your subscription, you will continue to have access to the premium features until the end of your current billing period, but you will not be charged for the next billing period.
              </p>
            </section>
            
            <Separator className="my-6" />
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Content</h2>
              <p className="mb-4">
                Our Services allow you to create, upload, and share content. You retain ownership of any intellectual property rights that you hold in that content.
              </p>
              <p className="mb-4">
                By uploading content to our Services, you grant AI Quizzy a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display your content in connection with the Services.
              </p>
            </section>
            
            <Separator className="my-6" />
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Termination</h2>
              <p className="mb-4">
                We may terminate or suspend your account and bar access to the Services immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
              </p>
              <p className="mb-4">
                If you wish to terminate your account, you may simply discontinue using the Services or contact us for account deletion.
              </p>
            </section>
            
            <Separator className="my-6" />
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Changes to Terms</h2>
              <p className="mb-4">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect.
              </p>
              <p className="mb-4">
                By continuing to access or use our Services after any revisions become effective, you agree to be bound by the revised terms.
              </p>
            </section>
            
            <Separator className="my-6" />
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
              <p>
                If you have any questions about these Terms, please <Link to="/contact" className="text-primary hover:underline">contact us</Link>.
              </p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Terms;
