"use client";

import { FC, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/navigation";

interface AuthFormProps {
  type: "login" | "signup";
}

export const AuthForm: FC<AuthFormProps> = ({ type }) => {
  const isLogin = type === "login";
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingTwitter, setLoadingTwitter] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [otpModal, setOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    setEmailError("Please enter a valid email address");
  } else {
    setEmailError("");
  }
};

const validatePassword = () => {
  if (password !== confirmPassword) {
    setPasswordError("Passwords do not match");
  } else {
    setPasswordError("");
  }
};


  const handleSocialSignIn = async (provider: "google" | "twitter") => {
    provider === "google" ? setLoadingGoogle(true) : setLoadingTwitter(true);
    await signIn(provider, { callbackUrl: "/dashboard" });
    provider === "google" ? setLoadingGoogle(false) : setLoadingTwitter(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/register", {
        username,
        email,
        password,
      });

      if (!response.data.data) {
        console.error("❌ No token received from backend!");
      }
      setToken(response.data.data);
      setOtpModal(true);
    } catch (error) {
      console.error("Registration Failed:", error);
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    setLoading(true);

    if (!token) {
      console.error("❌ Token is missing before sending request!");
      alert("Something went wrong! Token is missing.");
      setLoading(false);
      return;
    }
    try {
      const response = await axios.post("http://localhost:5000/verify-otp", {
        otp,
        tempToken: token,
      });
      console.log("OTP Verification Response:", response.data);
      setOtpModal(false);
      router.push("/dashboard");
    } catch (error: any) {
      console.error("OTP Verification Failed:", error.response?.data || error);
      alert(error.response?.data?.message || "OTP Verification Failed");
    }
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/login", {
        email,
        password,
      }, { withCredentials: true }); // Important: allows cookies to be set
  
      console.log("Login Successful:", response.data);
      
      // Redirect to dashboard upon successful login
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login Failed:", error.response?.data || error);
      alert(error.response?.data?.message || "Invalid credentials");
    }
    setLoading(false);
  };
  

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 relative">
        <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-white">
          {isLogin ? "Log In to CloudSend" : "Create an Account"}
        </h2>

        <form className="space-y-4 mt-4" onSubmit={isLogin ? handleLogin : handleRegister}>

          {!isLogin && (
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={validateEmail}
            />
            {emailError && <span className="text-red-500 text-sm">{emailError}</span>}
          </div>
          <div className="relative">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full p-2 pr-10 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-5 h-5 text-gray-500 dark:text-gray-300" /> : <Eye className="w-5 h-5 text-gray-500 dark:text-gray-300" />}
              </button>
            </div>
          </div>
          {!isLogin && (
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm your password"
                className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={validatePassword}
              />
              {passwordError && <span className="text-red-500 text-sm">{passwordError}</span>}
            </div>
          )}
          <button type="submit" className="w-full mt-4 p-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-md">
            {loading ? <Loader2 className="animate-spin mx-auto" /> : isLogin ? "Log In" : "Sign Up"}
          </button>
          <div className="flex items-center justify-center mt-4 text-gray-700 dark:text-gray-300">
            <span className="flex-1 border-t border-gray-300 dark:border-gray-600"></span>
            <span className="mx-2">Or sign in with</span>
            <span className="flex-1 border-t border-gray-300 dark:border-gray-600"></span>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            <button onClick={() => handleSocialSignIn("google")}><img src="/google.svg" alt="Google" className="w-6 h-6" /></button>
            <button onClick={() => handleSocialSignIn("twitter")}><img src="/twitter.svg" alt="Twitter" className="w-6 h-6" /></button>
          </div>
        </form>
        {otpModal && (
          <div className="absolute inset-0 flex items-center justify-center bg-transparent backdrop-blur-md">
            <div className="bg-white bg-opacity-60 p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-bold text-gray-900">Enter OTP</h3>
              <input type="text" className="border p-2 mt-2 w-full text-gray-900" value={otp} onChange={(e) => setOtp(e.target.value)} />
              <button onClick={handleVerifyOtp} className="mt-4 p-2 bg-blue-900 text-white w-full rounded-lg">Verify OTP</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
