"use client";
import { motion } from "framer-motion";
import { UserPlus, Upload, Globe, Share2, Download } from "lucide-react";

const steps = [
  {
    icon: <UserPlus className="w-12 h-12 text-yellow-400" />,
    title: "Register",
    description: "Create an account to start securely sharing and storing your files."
  },
  {
    icon: <Upload className="w-12 h-12 text-green-400" />,
    title: "Upload File",
    description: "Easily upload your files with military-grade encryption."
  },
  {
    icon: <Globe className="w-12 h-12 text-blue-400" />,
    title: "Access Anywhere",
    description: "Retrieve your files anytime, anywhere with ease."
  },
  {
    icon: <Share2 className="w-12 h-12 text-purple-400" />,
    title: "Secure Sharing",
    description: "Share files securely with end-to-end encryption."
  },
  {
    icon: <Download className="w-12 h-12 text-red-400" />,
    title: "Download Anytime",
    description: "Receivers can download shared files whenever they need."
  }
];

const HowItWorks = () => {
  return (
    <section className="relative py-32 px-6 bg-gradient-to-b from-blue-900 via-gray-900 to-black text-white">
      <div className="max-w-6xl mx-auto text-center relative z-10">
        <motion.h2 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-3xl md:text-4xl font-extrabold"
        >
          How It Works
        </motion.h2>
        <p className="mt-4 text-gray-300 text-lg">
          Secure, seamless, and effortless file sharing in five simple steps.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-12 mt-20 max-w-6xl mx-auto relative z-10">
        {steps.map((step, index) => (
          <motion.div 
            key={index} 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            viewport={{ once: true }}
            className="flex flex-col items-center text-center p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700 w-64"
          >
            <div className="mb-4">{step.icon}</div>
            <h3 className="text-xl font-semibold">{step.title}</h3>
            <p className="text-gray-300 mt-2">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;