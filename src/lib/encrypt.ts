function toBase64(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function fromBase64(base64: string): Uint8Array {
    return (Uint8Array as any).fromBase64(base64);
}

async function generateKeyPair() {
    return await crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 4096,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"],
    );
}

async function encrypt(text: string, publicKey: CryptoKey) {
    const encoder = new TextEncoder();
    const buf = encoder.encode(text);
    return await crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, buf);
}

async function decrypt(cipher: BufferSource, privateKey: CryptoKey) {
    const buf = await crypto.subtle.decrypt(
        { name: "RSA-OAEP" },
        privateKey,
        cipher,
    );
    return new TextDecoder().decode(buf);
}

async function deriveKey(password: string, salt: any): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        "PBKDF2",
        false,
        ["deriveKey"],
    );

    return crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt,
            iterations: 100000,
            hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["wrapKey", "unwrapKey"],
    );
}

async function wrapPrivateKey(
    privateKey: CryptoKey,
    password: string,
): Promise<{ salt: Uint8Array; iv: Uint8Array; wrappedKey: ArrayBuffer }> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const wrappingKey = await deriveKey(password, salt);

    const wrappedKey = await crypto.subtle.wrapKey(
        "pkcs8",
        privateKey,
        wrappingKey,
        { name: "AES-GCM", iv },
    );

    return { salt, iv, wrappedKey };
}

async function unwrapPrivateKey(
    wrappedKey: BufferSource,
    password: string,
    salt: Uint8Array,
    iv: BufferSource,
): Promise<CryptoKey> {
    const wrappingKey = await deriveKey(password, salt);

    return crypto.subtle.unwrapKey(
        "pkcs8",
        wrappedKey,
        wrappingKey,
        { name: "AES-GCM", iv },
        { name: "RSA-OAEP", hash: "SHA-256" },
        true,
        ["decrypt"],
    );
}

async function exportPublicKey(key: CryptoKey): Promise<string> {
    const exported = await crypto.subtle.exportKey("spki", key);
    return toBase64(exported);
}

async function importPublicKey(base64Key: string): Promise<CryptoKey> {
    const keyData = fromBase64(base64Key) as BufferSource;
    return crypto.subtle.importKey(
        "spki",
        keyData,
        { name: "RSA-OAEP", hash: "SHA-256" },
        true,
        ["encrypt"],
    );
}

export interface WrappedKeyBundle {
    salt: string;
    iv: string;
    wrappedKey: string;
    publicKey: string;
}

interface EncryptedMessage {
    encryptedKey: string;
    iv: string;
    ciphertext: string;
}

class Encryption {
    private privateKey: CryptoKey;

    private constructor(privateKey: CryptoKey, publicKey: CryptoKey) {
        this.privateKey = privateKey;
    }

    static async fromBundle(
        bundle: WrappedKeyBundle,
        password: string,
    ): Promise<Encryption> {
        const privateKey = await unwrapPrivateKey(
            fromBase64(bundle.wrappedKey) as BufferSource,
            password,
            fromBase64(bundle.salt),
            fromBase64(bundle.iv) as BufferSource,
        );
        const publicKey = await importPublicKey(bundle.publicKey);
        return new Encryption(privateKey, publicKey);
    }

    static async encryptTo(
        text: string,
        recipientPublicKey: string,
    ): Promise<string> {
        const pubKey = await importPublicKey(recipientPublicKey);
        const ciphertext = await encrypt(text, pubKey);
        return toBase64(ciphertext);
    }

    async decrypt(ciphertext: string): Promise<string> {
        return await decrypt(
            fromBase64(ciphertext) as BufferSource,
            this.privateKey,
        );
    }
}

async function createBundle(password: string): Promise<WrappedKeyBundle> {
    const keyPair = await generateKeyPair();
    const { salt, iv, wrappedKey } = await wrapPrivateKey(
        keyPair.privateKey,
        password,
    );
    const publicKey = await exportPublicKey(keyPair.publicKey);
    return {
        salt: toBase64(salt),
        iv: toBase64(iv),
        wrappedKey: toBase64(wrappedKey),
        publicKey,
    };
}

export { Encryption, encrypt, decrypt, importPublicKey, createBundle }