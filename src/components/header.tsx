"use client"
import { authClient } from "@/lib/auth-client"

export default function Header() {
    const { data } = authClient.useSession();

    return (
        <div className="bg-zinc-800">
            <div className="flex justify-between items-center max-w-2xl mx-auto flex-wrap h-14 mb-8">
                <button onClick={ () => window.location.href="/"} className="cursor-pointer"><h1 className="font-semibold text-2xl text-blue-400" >{data?.user.name ?? "Encryption"}</h1></button>
                
                <button className="text-blue-200 p-2 border-3 rounded-2xl bg-blue-700 border-blue-700 cursor-pointer" onClick={async () => {
                    if (data?.user.id) {
                        return await authClient.signOut({
                            fetchOptions: {
                                onSuccess: () => {
                                    window.location.reload()
                                }
                            }
                        })
                    }
                    window.location.href ="/sign-up"
                }}>{data?.user.id ? (
                    <p>Logout</p>
                ) : (
                    <p>Sign up</p>
                )}</button>
            </div>
        </div>
    )
}