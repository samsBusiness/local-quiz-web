"use client";

import { useState } from "react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { Toast } from "radix-ui";
import { toast } from "sonner";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async (credentialResponse: CredentialResponse) => {
    setIsLoading(true);
    
    try {
      if (!credentialResponse.credential) {
        throw new Error("No credential received");
      }
      
      // Decode the JWT to get user info
      const decodedToken = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
      console.log("Decoded token:", decodedToken);
      console.log("Email:", decodedToken.email);
      console.log("Name:", decodedToken.name);
      console.log("Picture:", decodedToken.picture);

      // Send the credential to your backend
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: decodedToken.email,
          provider: "google",
          providerToken: decodedToken.sub,
        }),
      });

      const result = await response.json();
      
      if (result.status === 200) {
        // Store the token and redirect to dashboard
        localStorage.setItem("token", result.data.token);
        window.location.href = "/dashboard";
      } else {
        console.error("Login failed:", result.message);
        toast.error(result.message || "Login failed. Please try again.", {
          position: "top-right",
          duration: 5000,
          style: { background: "#f87171", color: "#fff" },
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 font-sans">
      <main className="flex flex-col items-center justify-center gap-8 p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">
            Welcome to
          </h1>
          <h2 className="text-6xl font-bold text-indigo-600 mb-8">
            Locahoot
          </h2>
          <p className="text-xl text-gray-600 max-w-md">
            Your interactive quiz platform for engaging learning experiences
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <GoogleLogin
            onSuccess={handleGoogleSignIn}
            onError={() => {
              console.error("Login Failed");
              setIsLoading(false);
            }}
            useOneTap
            theme="filled_blue"
            text="signin_with"
            shape="pill"
            size="large"
          />
          
          {isLoading && (
            <p className="text-sm text-gray-500">
              Signing in...
            </p>
          )}
        </div>

        <p className="text-sm text-gray-500 mt-4">
          Sign in to access your quiz dashboard
        </p>
      </main>
    </div>
  );
}
