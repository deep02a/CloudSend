"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Spotlight } from "@/app/components/ui/spotlight-new";
import Link from "next/link";

export function HeroSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const backgroundOpacity = useTransform(scrollYProgress, [0, 0.8], [0, 1]);

  return (
    <motion.div
      ref={ref}
      style={{ opacity }}
      className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-800 via-blue-900 to-black overflow-hidden"
    >
      <Spotlight />
      <motion.div
        style={{ opacity: backgroundOpacity }}
        className="absolute inset-0 bg-black"
      />
      <div className="relative z-10 w-full max-w-7xl mx-auto text-center px-4 pb-20">
        <h1 className="text-4xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
          CloudSend <br /> "Secure. Fast. Effortless."
        </h1>
        <p className="mt-4 text-lg text-neutral-300 max-w-lg mx-auto">
        "CloudSend lets you store and share files securely with military-grade AES-256 encryption. Whether for personal use or business collaboration, your data stays private with end-to-end protection. Send large files instantly, access them anywhere, and enjoy peace of mind knowing your files are always safe."
        </p>
        <div className="mt-8 flex flex-col md:flex-row gap-4 justify-center">
          <Link href="/signup">
            <button className="px-6 py-2 border border-white text-white rounded-lg font-bold transform hover:-translate-y-1 transition">
              Sign Up
            </button>
          </Link>
          <Link href="/login">
            <button className="px-8 py-2 bg-white text-gray-700 rounded-md font-medium hover:bg-gray-200 transition">
              Log In
            </button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
