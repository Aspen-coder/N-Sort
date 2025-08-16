"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Brain, Chrome, ArrowLeft, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  //const [user, setUser] = useState<FirebaseUser | null>(null);
  //const [loading, setLoading] = useState(true);
  const {user, loading} = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push("/"); // or your game route
    }
  }, [user, router]);
  // Show loading while checking auth state
  if (loading) {
    console.log("loading...");
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-purple-700 font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (isSignUp && !formData.name.trim()) {
      newErrors.name = "Username is required";
    }
    if(formData.name.length > 16){
      newErrors.name = "Username must be at most 16 characters in length";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  {/* avoid duplicate usernames */}
  // Function to check if username exists
const checkUsernameAvailable = async (username: string) => {
  const docRef = doc(db, 'usernames', username.toLowerCase());
  const docSnap = await getDoc(docRef);
  return !docSnap.exists();
};

// In your sign-up process



  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if(isSignUp){
      const isAvailable = await checkUsernameAvailable(formData.name); // avoid duplicate usernames
      if (!isAvailable) {
        setErrors({ name: "Username already taken" });
        return;
      }
    }
    
    setIsLoading(true);
    setErrors({});

    try {
      if (isSignUp) {
        // Create new user
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          formData.email, 
          formData.password
        );
        
        // Update profile with name
        if (formData.name) {
          await updateProfile(userCredential.user, {
            displayName: formData.name
          });
          // After successful user creation
          await setDoc(doc(db, 'usernames', formData.name.toLowerCase()), {
            uid: userCredential.user.uid,
            createdAt: new Date()
          });

          // Also store in the user's profile
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            username: formData.name,
            email: formData.email,
            // other user data
          });
          console.log("Everything set, now my status should still be loading");

        }
      } else {
        // Sign in existing user
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
      }
      
      // Redirect will happen automatically via onAuthStateChanged
    } catch (error: unknown) {
      if(error instanceof FirebaseError){
        console.error("Auth error:", error);
        let errorMessage = "Something went wrong. Please try again.";
        
        switch (error.code) {
          case "auth/user-not-found":
          case "auth/wrong-password":
            errorMessage = "Invalid email or password";
            break;
          case "auth/email-already-in-use":
            errorMessage = "An account with this email already exists";
            break;
          case "auth/weak-password":
            errorMessage = "Password is too weak";
            break;
          case "auth/invalid-email":
            errorMessage = "Invalid email address";
            break;
          case "auth/too-many-requests":
            errorMessage = "Too many failed attempts. Please try again later.";
            break;
        }
        
        setErrors({ general: errorMessage });
      }
    } finally {
      console.log("Removing loading status");
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrors({});
    
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // Redirect will happen automatically via onAuthStateChanged
    } catch (error: unknown) {
      if(error instanceof FirebaseError){
        console.error("Google sign in error:", error);
        let errorMessage = "Failed to sign in with Google";
        
        if (error.code === "auth/popup-closed-by-user") {
          errorMessage = "Sign in was cancelled";
        }
        setErrors({ general: errorMessage });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Back button */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-purple-700 hover:text-purple-800 mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Game
        </button>

        {/* Login Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-purple-100 shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Brain className="w-16 h-16 text-purple-600 drop-shadow-sm" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="text-gray-600">
              {isSignUp 
                ? "Join N‑Sort Challenge and start tracking your progress" 
                : "Sign in to access your saved progress and stats"
              }
            </p>
          </div>

          {/* Error message */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {errors.general}
            </div>
          )}

          {/* Email/Password form */}
          <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
            {/* Name field (only for sign up) */}
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                      errors.name ? "border-red-300 bg-red-50" : "border-gray-300"
                    }`}
                    placeholder="Enter your username"
                  />
                </div>
                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
              </div>
            )}

            {/* Email field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    errors.email ? "border-red-300 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Password field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    errors.password ? "border-red-300 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder={isSignUp ? "Create a password (6+ characters)" : "Enter your password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{isSignUp ? "Creating Account..." : "Signing In..."}</span>
                </div>
              ) : (
                <span>{isSignUp ? "Create Account" : "Sign In"}</span>
              )}
            </button>
          </form>

          {/* Toggle sign up/sign in */}
          <div className="text-center mb-6">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setFormData({ email: "", password: "", name: "" });
                setErrors({});
              }}
              className="text-sm text-purple-600 hover:text-purple-700 transition-colors underline"
            >
              {isSignUp 
                ? "Already have an account? Sign In" 
                : "Don't have an account? Sign Up"
              }
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Google sign in button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-white hover:bg-gray-50 border border-gray-300 rounded-xl px-6 py-4 flex items-center justify-center gap-3 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                <span className="font-medium text-gray-700">Signing in...</span>
              </>
            ) : (
              <>
                <Chrome className="w-5 h-5 text-gray-600 group-hover:text-gray-700 transition-colors" />
                <span className="font-medium text-gray-700 group-hover:text-gray-800 transition-colors">
                  Continue with Google
                </span>
              </>
            )}
          </button>

          {/* Benefits */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center mb-4 font-medium">
              Why sign in?
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
                <span>Save your high scores and statistics</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
                <span>Track your cognitive improvement over time</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
                <span>Compete on global leaderboards</span>
              </div>
            </div>
          </div>

          {/* Skip option */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <button
              onClick={() => router.push("/")}
              className="text-sm text-gray-500 hover:text-purple-600 transition-colors underline"
            >
              Skip for now and play as guest
            </button>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Your data is secure and only used for authentication.
        </p>
      </div>
    </div>
  );
}