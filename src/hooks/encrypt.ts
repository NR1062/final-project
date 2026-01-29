import { useEffect } from "react";

export default function useEncryption() {
    useEffect(() => {
        
    })
}

async function getBundle() {
    const response = await fetch("/api/user");
    if (!response.ok) {
        return
    }
    const bundle = await response.json();
    return bundle
}