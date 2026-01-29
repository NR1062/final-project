"use client";
import { authClient } from "@/lib/auth-client";
import { Encryption } from "@/lib/encrypt";
import {
  Globe,
  GlobeLock,
  Loader2,
  Lock,
  LockOpen,
  Mail,
} from "lucide-react";
import { useContext, useEffect, useState } from "react";

export default function Home() {
  const { data, isPending } = authClient.useSession();
  const [rawText, setRawText] = useState("");
  const [encryptedText, setEncryptedText] = useState<string>("");
  const [recipient, setRecipient] = useState("");
  
  if (isPending) {
    return (
      <div className="flex justify-center">
        <Loader2 className="animate-spin text-white" />
      </div>
    );
  }

  if (!data?.session) {
    return <LoginPage />;
  }

  return (
    <>
      <div className="max-w-3xl shadow-xl mx-auto rounded-xl p-6 bg-gray-800">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex gap-3 items-center">
              <GlobeLock className="text-white h-6 w-6" />
              <h2 className="text-white text-xl font-semibold">Encryption</h2>
            </div>
            <div className="relative mt-6">
              <input
                className="text-white outline-none border-2 p-2 rounded-xl border-gray-700 pl-10 transition-colors focus:border-blue-500 ring-1 ring-gray-700 focus:ring-blue-500 placeholder-white"
                placeholder="Encrypt..."
                onChange={(e) => setRawText(e.target.value)}
              />
              <Lock className="text-white absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <div className="relative mt-3">
              <input
                className="text-white outline-none border-2 border-gray-700 p-2 pl-10 rounded-xl transition-colors focus:border-blue-500 ring-1 ring-gray-700 focus:ring-blue-500 placeholder-white"
                placeholder="Email..."
                onChange={(e) => setRecipient(e.target.value)}
              />
              <Mail className="text-white absoute top-8.5 -translate-y-8.5 right-6 translate-x-3" />
            </div>
            <button
              className="mt-4 px-4 py-2 m-2 text-white rounded-lg bg-blue-600 font-medium cursor-pointer"
              onClick={() => {
                handleEncrypt(rawText, recipient).then((cipher) => {
                  setEncryptedText(cipher!);
                });
              }}
            >
              Encrypt
            </button>
          </div>

          <div className="p-2 border-2 border-blue-500 wrap-break-word text-white rounded-2xl">
            {encryptedText}
          </div>
        </div>
      </div>

      <Decryption />
    </>
  );
}

async function handleEncrypt(rawText: string, email: string) {
  const response = await fetch(`/api/user/pubkey/${email}`);
  if (!response.ok) {
    alert("Recipient does not exist")
    return;
  }
  const { publicKey } = await response.json();
  const cipherText = await Encryption.encryptTo(rawText, publicKey);
  return cipherText;
}

function Decryption() {
  const [encryption, setEncryption] = useState<Encryption | null>(null)
  const [encryptedCipher, setEncryptedCipher] = useState("")
  const [decryptedText, setDecryptedText] = useState("")

  useEffect(() => {
    const getBundle = async () => {
      const response = await fetch("/api/user");
      console.log("fetching private key")
      if (!response.ok) {
        return;
      }
      const bundle = await response.json();
      const instance = await Encryption.fromBundle(bundle, localStorage.getItem("decrypt")!)
      setEncryption(instance)
      console.log("created instance", instance)
    } 
    getBundle();
  }, [])

  return (
    <div className="max-w-3xl shadow-xl mx-auto rounded-xl p-6 mt-6 bg-gray-800">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex gap-3 items-center">
            <Globe className="text-white h-6 w-6" />
            <h2 className="text-white text-xl font-semibold">Decryption</h2>
          </div>
          <div className="relative mt-6">
            <input
              className="text-white outline-none border-2 p-2 rounded-xl border-gray-700 pl-10 transition-colors focus:border-blue-500 ring-1 ring-gray-700 focus:ring-blue-500 placeholder-white"
              placeholder="Decrypt..."
              onChange={(e) => setEncryptedCipher(e.target.value)}
            />
            <LockOpen className="text-white absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <button className="mt-4 px-4 py-2 m-2 text-white rounded-lg bg-blue-600 font-medium cursor-pointer"
          onClick={() => {
            encryption?.decrypt(encryptedCipher).then((decryptedText) => {
              setDecryptedText(decryptedText);
            })
          }}
          >
            Decrypt
          </button>
        </div>

        <div className="p-2 border-2 wrap-break-word border-blue-500 text-white rounded-2xl">{decryptedText}</div>
      </div>
    </div>
  );
}

// LOGIN CREDENTIALS

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    console.log("logging in", email, password);
    const { data, error } = await authClient.signIn.email({
      email,
      password,
    });
    if (error) {
      alert("Invalid Credentials");
      return;
    }
    localStorage.setItem("decrypt", password);
  };

  return (
    <div className="flex flex-col items-center justify-center mt-8 text-white">
      <div className="grid gap-2">
        <h1 className="text-2xl font-semibold justify-self-center">Login</h1>

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
            type="submit"
            id="login-button"
            onClick={login}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
