# 🚀 Bitespeed Identity Reconciliation Service

A backend service for the **Bitespeed Backend Task** – identifying and linking customer contacts using email and/or phone number.

---

## 📘 Problem Statement

Bitespeed collects contact details from users (`email` or `phoneNumber`) and needs to **merge contacts** that belong to the same person.  
Users may use different contact information for different orders, but they should be linked based on shared email/phone numbers.

- Contacts are stored in a SQL database.
- Each contact is either:
  - **primary**: the oldest known contact of a user.
  - **secondary**: any other contact linked to that primary.

---

## ⚙️ Tech Stack

- **Backend**: Node.js, Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: MySQL
- **Dev Tools**: Postman, Prisma Studio

---

## 📁 Project Structure

```
bitespeed-identity-service/
│
├── prisma/
│   └── schema.prisma              # Prisma schema (Contact model)
│
├── src/
│   ├── server.ts                  # Main server entry
│   ├── app.ts                     # Express app config
│   ├── routes/
│   │   └── identify.ts            # Route handler for POST /identify
│   └── utils/
│       └── contactUtils.ts        # Core logic to handle contact merging
│
├── .env                           # Environment variables (DB URL, Port)
├── package.json                   # Scripts & dependencies
└── tsconfig.json                  # TypeScript config
```

---

## 📦 Setup Instructions

### 1️⃣ Clone the Repo

```bash
git clone https://github.com/your-username/bitespeed-identity-service.git
cd bitespeed-identity-service
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Configure Environment

Create a `.env` file in the root with your local MySQL config:

```ini
PORT=5000
DATABASE_URL="mysql://root:yourPassword@localhost:3306/bitespeed"
```

### 4️⃣ Run Prisma Migration

```bash
npx prisma migrate dev --name init
```
This will:
- Create the Contact table in your DB
- Apply migrations
- Generate Prisma client

### 5️⃣ Start the Server

```bash
npm run dev
```
If successful, you’ll see:
```
Server running at http://localhost:5000
```

---

## 🔥 API Endpoint

### POST `/identify`

#### 📥 Request Body

```json
{
  "email": "mcfly@hillvalley.edu",
  "phoneNumber": "123456"
}
```
> You must provide at least one of `email` or `phoneNumber`.

#### 📤 Response

```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["lorraine@hillvalley.edu", "mcfly@hillvalley.edu"],
    "phoneNumbers": ["123456"],
    "secondaryContactIds": [23]
  }
}
```

---

## 🧠 How It Works

- **No contact exists:** A new primary contact is created.
- **Contact exists & new info provided:** A secondary contact is created and linked to the primary.
- **Two different primary contacts are linked by new input:** One is converted to secondary.
- **All linked contacts** are returned in a clean, deduplicated format.

---

## ✅ Example Scenarios

### 🧪 New Contact

```http
POST /identify
{
  "email": "doc@flux.com"
}
```
🟢 *Response creates new primary contact.*

---

### 🧪 Linking Existing Contact

```http
POST /identify
{
  "email": "doc@flux.com",
  "phoneNumber": "9999999999"
}
```
🟢 *Adds a secondary contact if phone number was new.*

---

## 🛠 Dev Tools

- 🌐 **Prisma Studio** — visual DB UI

```bash
npx prisma studio
```

---

## 🤝 Author

Made by **Aakash Ojha"**  
**Computer Science Engineer & Full Stack Developer**.  
Ready to dominate hackathons and backend dev challenges!

---