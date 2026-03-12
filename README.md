# BruinBazaar

An online marketplace for UCLA students to buy, sell, and trade items with each other. BruinBazaar connects buyers and sellers within the UCLA community through listings, real-time messaging, and user profiles.

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/ZachSham/Bruin_Bazaar.git
cd Bruin_Bazaar
```

---

### 2. Environment Variables

Create a `.env` file in the **server root** (or project root, wherever `server.js` lives) with the following variables:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_ORIGIN=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```
> **Note:** A `.env` file is included in the submitted tarball for local deployment. Do not commit this file to version control.
---

### 3. Install Dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd client
npm install
```

---

### 4. Run the App

**Start the backend server:**
```bash
cd server
npm start
# Server runs on http://localhost:3000
```

**Start the frontend (in a separate terminal):**
```bash
cd client
npm run dev
# App runs on http://localhost:5173
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Deployment Notes

- The frontend communicates with the backend via the `API_URL` variable defined in `client/src/config.js`
- Socket.io is used for real-time messaging and requires the backend server to be running
- Make sure `CLIENT_ORIGIN` in `.env` matches the exact origin of the frontend (no trailing slash)

---

## Group Members

- Ji Min Cha
- Ye Chan Lin
- Rhett Selby
- Zach Shamieh
- Ashley Tran
