"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { ShieldCheck, CloudUpload, Lock, Users } from "lucide-react";
import { useRef } from "react";

const features = [
  {
    icon: <ShieldCheck className="w-10 h-10 text-blue-600" />, 
    title: "End-to-End Encryption",
    description: "Your files are fully encrypted, ensuring only you and the intended recipient can access them."
  },
  {
    icon: <CloudUpload className="w-10 h-10 text-green-500" />, 
    title: "Seamless Cloud Storage",
    description: "Upload and manage your files securely with our powerful cloud-based infrastructure."
  },
  {
    icon: <Lock className="w-10 h-10 text-red-500" />, 
    title: "Secure File Sharing",
    description: "Share files with confidence, knowing your data remains safe and private."
  },
  {
    icon: <Users className="w-10 h-10 text-purple-500" />, 
    title: "Collaborate Effortlessly",
    description: "Invite team members and share files instantly, making collaboration easier than ever."
  }
];

const AboutSection = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start start"] });
  
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const translateY = useTransform(scrollYProgress, [0, 1], [50, 0]);

  return (
    <motion.section 
      ref={ref} 
      style={{ opacity, y: translateY }}
      className="relative py-32 px-6 bg-gradient-to-b from-black via-blue-950 to-blue-900"
    >
      <div className="max-w-6xl mx-auto text-center relative z-10">
        <motion.h2 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-3xl md:text-4xl font-extrabold text-white"
        >
          Why Choose CloudSend?
        </motion.h2>
        <p className="mt-4 text-gray-300 text-lg">
          Secure, fast, and easy-to-use encrypted file sharing for individuals and teams.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20 max-w-6xl mx-auto relative z-10">
        {features.map((feature, index) => (
          <motion.div 
            key={index} 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            viewport={{ once: true }}
            className="bg-blue-900 p-8 rounded-2xl shadow-xl flex flex-col items-center text-center border border-gray-700"
          >
            {feature.icon}
            <h3 className="text-xl font-semibold text-white mt-4">
              {feature.title}
            </h3>
            <p className="text-gray-300 mt-2">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default AboutSection;