
import React from "react";
import Navigation from "@/components/Navigation";
import ContactUs from "@/components/ContactUs";

const Contact = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navigation />
      <main className="py-8 px-4">
        <ContactUs />
      </main>
    </div>
  );
};

export default Contact;
