import crypto from 'crypto'

// Use a fallback robust hash to generate a fixed 32-byte key from existing env vars.
const getEncryptionKey = (): Buffer => {
  const secret = process.env.ENCRYPTION_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'default_secret_nurea_key_fallback';
  return crypto.createHash('sha256').update(secret).digest();
}

const ALGORITHM = 'aes-256-gcm'

export function encryptToken(text: string): string {
  if (!text) return text
  
  const key = getEncryptionKey()
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const authTag = cipher.getAuthTag().toString('hex')
  
  return `${iv.toString('hex')}:${authTag}:${encrypted}`
}

export function decryptToken(encryptedData: string): string {
  if (!encryptedData) return encryptedData
  
  try {
    const key = getEncryptionKey()
    const parts = encryptedData.split(':')
    if (parts.length !== 3) return encryptedData // Might be unencrypted or invalid format
    
    const iv = Buffer.from(parts[0], 'hex')
    const authTag = Buffer.from(parts[1], 'hex')
    const encryptedText = parts[2]
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error) {
    console.error("Failed to decrypt token:", error)
    return encryptedData // Fallback gracefully
  }
}
