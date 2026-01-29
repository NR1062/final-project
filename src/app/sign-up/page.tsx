"use client";
import { authClient } from "@/lib/auth-client";
import { createBundle } from "@/lib/encrypt";
import { useState } from "react";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signUp = async () => {
    console.log("logging in", email, password);
    const bundle = await createBundle(password);
    const { data, error } = await authClient.signUp.email({
      email,
      password,
      name: email,
      privateKey: bundle.wrappedKey,
      publicKey: bundle.publicKey,
      callbackURL: "/",
      salt: bundle.salt,
      iv: bundle.iv
    });

    if (error) {
      alert(error.message);
      return;
    }
    window.location.href = "/";
  };

  return (
    <div className="flex flex-col items-center justify-center mt-8 text-white">
      <div className="grid gap-2">
        <h1 className="text-2xl font-semibold justify-self-center">Sign Up</h1>

        <div className="field mt-3">
          <h4>User</h4>
          <input
            className="border px-1 rounded border-gray-400 ring-gray-100 outline-none transition-colors focus:ring-blue-400 ring-1 p-1"
            placeholder="username"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="field">
          <h4>Password</h4>
          <input
            className="border px-1 rounded border-gray-400 ring-gray-100 outline-none transition-colors focus:ring-blue-400 ring-1 p-1"
            type="password"
            placeholder="password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="field">
          <button
            className="border p-[3.5px] border-blue-600 bg-blue-600 text-gray-100 rounded-lg cursor-pointer"
            id="login-button"
            onClick={signUp}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>

    // loooooooooool

    // loooooooooool

    // loooooooooool

    // loooooooooool

    
  );
}
