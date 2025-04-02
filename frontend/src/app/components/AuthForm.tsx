"use client";

import { FC, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Image from "next/image";

interface AuthFormProps {
  type: "login" | "signup";
}

export const AuthForm: FC<AuthFormProps> = ({ type }) => {
  const isLogin = type === "login";
  const [showPassword, setShowPassword] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingTwitter, setLoadingTwitter] = useState(false);

  const handleSocialSignIn = async (provider: "google" | "twitter") => {
    provider === "google" ? setLoadingGoogle(true) : setLoadingTwitter(true);
    await signIn(provider, { callbackUrl: "/" });
    provider === "google" ? setLoadingGoogle(false) : setLoadingTwitter(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-white">
          {isLogin ? "Log In to CloudSend" : "Create an Account"}
        </h2>

        <form className="space-y-4 mt-4">
          {!isLogin && (
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="relative">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full p-2 pr-10 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-gray-500 dark:text-gray-300" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-500 dark:text-gray-300" />
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full mt-4 p-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-md"
          >
            {isLogin ? "Log In" : "Sign Up"}
          </button>
        </form>

        {/* Social Login with a Clean Layout */}
        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-300 dark:border-gray-600" />
          <span className="mx-3 text-gray-500 dark:text-gray-400 text-sm">or continue with</span>
          <hr className="flex-grow border-gray-300 dark:border-gray-600" />
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => handleSocialSignIn("google")}
            disabled={loadingGoogle}
            className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition shadow-md"
          >
            {loadingGoogle ? (
              <Loader2 className="animate-spin w-5 h-5 text-gray-500" />
            ) : (
              <Image src="/google.svg" alt="Google" width={24} height={24} />
            )}
          </button>

          <button
            onClick={() => handleSocialSignIn("twitter")}
            disabled={loadingTwitter}
            className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition shadow-md"
          >
            {loadingTwitter ? (
              <Loader2 className="animate-spin w-5 h-5 text-gray-500" />
            ) : (
              <Image src="/twitter.svg" alt="Twitter" width={24} height={24} />
            )}
          </button>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">
          {isLogin ? (
            <>
              Don't have an account? <Link href="/signup" className="text-blue-500 hover:underline">Sign up</Link>
            </>
          ) : (
            <>
              Already have an account? <Link href="/login" className="text-blue-500 hover:underline">Log in</Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
};
