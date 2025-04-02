"use client";
import { motion } from "framer-motion";
import { Facebook, Twitter, Linkedin, Mail, Globe } from "lucide-react";
import Link from "next/link";

const Footer = () => {
  return (
    <motion.footer 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="bg-gray-900 text-gray-300 py-12 px-6"
    >
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-center md:text-left">
        {/* Brand Info */}
        <div>
          <h2 className="text-2xl font-bold text-white">CloudSend</h2>
          <p className="mt-2 text-sm">Secure. Fast. Effortless. Share and store your files with AES-256 encryption.</p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-semibold text-white">Quick Links</h3>
          <ul className="mt-2 space-y-2">
            <li><Link href="/" className="hover:text-blue-400 transition">Home</Link></li>
            <li><Link href="/about" className="hover:text-blue-400 transition">About</Link></li>
            <li><Link href="/features" className="hover:text-blue-400 transition">Features</Link></li>
            <li><Link href="/contact" className="hover:text-blue-400 transition">Contact</Link></li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-xl font-semibold text-white">Connect With Us</h3>
          <div className="flex justify-center md:justify-start mt-3 space-x-4">
            <a href="#" className="hover:text-blue-400 transition"><Facebook className="w-6 h-6" /></a>
            <a href="#" className="hover:text-blue-400 transition"><Twitter className="w-6 h-6" /></a>
            <a href="#" className="hover:text-blue-400 transition"><Linkedin className="w-6 h-6" /></a>
            <a href="#" className="hover:text-blue-400 transition"><Mail className="w-6 h-6" /></a>
            <a href="#" className="hover:text-blue-400 transition"><Globe className="w-6 h-6" /></a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-10 text-center border-t border-gray-700 pt-6 text-sm">
        <p>&copy; {new Date().getFullYear()} CloudSend. All rights reserved.</p>
      </div>
    </motion.footer>
  );
};

export default Footer;
