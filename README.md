# CloudSend – Secure Encrypted File Sharing and Storage

CloudSend is a full-stack secure file-sharing and storage platform that ensures *true end-to-end encryption (E2EE)* of user files. It enables users to upload, store, and share files securely using AES-256 encryption, with support for OTP-based email verification and JWT-based authentication.

---

## Features

- *End-to-End Encrypted File Uploads (AES-256-CBC)*
- *Secure Encrypted File Sharing Between Users*
- *User Authentication with OTP-based Email Verification*
- *JWT Access & Refresh Tokens for Auth Sessions*
- *AWS S3 for Encrypted File Storage*
- *Encrypted Key Exchange Between Users*
- *File Management Dashboard (Upload, Rename, Download, Share)*
- *Frontend in Next.js with Tailwind & Framer Motion*

---

## Tech Stack

### Backend
- *Express.js* – RESTful API
- *Sequelize ORM* + *PostgreSQL* – Database
- *AWS S3* – Encrypted file storage
- *bcrypt* – Password hashing
- *jsonwebtoken* – JWT auth
- *Nodemailer* – OTP email delivery
- *Multer* – File upload handler
- *Crypto* – AES-256-CBC encryption/decryption

### Frontend
- *Next.js* (React framework)
- *Tailwind CSS + Accernity UI* – Modern UI
- *Framer Motion* – UI animations
- *Axios* – API integration

---

## Security Features

### End-to-End Encryption (E2EE) Workflow

- Files are encrypted using *AES-256-CBC* before being uploaded.
- Each user has a unique encryption key stored securely and encrypted.
- *IVs (Initialization Vectors)* are generated per file and stored safely.
- Files are uploaded to *AWS S3* in encrypted form.

### Secure File Sharing Flow

- When a file is shared:
  - The sender's encryption key is *decrypted* and then *re-encrypted specifically for the recipient*.
  - This is stored in the FileShares table as encryptedKeyForRecipient.
- Only the *intended recipient* can decrypt this key using their own credentials, allowing them to access and decrypt the file.
- This ensures *true E2EE*, even for shared files — the server cannot access decrypted contents.

### Other Protections

- Passwords are hashed using *bcrypt*.
- Access and refresh tokens are signed and verified with secure secrets.
- OTP verification ensures only verified users can access their accounts.

---

## Database Models

### User
- email (PK)
- username
- password (hashed)
- encryptionKey (securely encrypted)
- isVerified
- refreshToken

### Files
- id
- originalName
- size
- iv (stored securely)
- s3Key (AWS S3 path)
- userEmail (FK → User)

### FileShares
- id
- fileId (FK → Files)
- senderEmail (FK → User)
- recipientEmail (FK → User)
- encryptedKeyForRecipient (unique to recipient)

---

## Project Structure
