# MediQ — README for Developers

MediQ is a web application that provides Ontarians with real-time information about nearby healthcare organizations, including estimated wait times. It uses data from OpenStreetMap (via the Overpass API), stores organizations in MongoDB, and provides wait time estimates via an internal service.

---

## 📦 Required Components

To run MediQ, you’ll need the following:

- **Node.js** (v16+ recommended)
- **MongoDB** (local or remote instance)
- **Overpass API** (used to query OSM data — no setup needed, it's accessed via public endpoint)

---

## 🔐 Environment Variables Required

To ensure the application runs smoothly. Please create an `.env` file in the root directory.

### 1. Create an `env` file inside the root directory
The env file should contain the following variables:

```
MONGO_CONNECTION_STRING=mongodb+srv://admin......
AUTHORIZATION_TOKEN=RANDOM
NEXT_PUBLIC_API_BASE_URL=localhost:4000
```
> Please note that the `MONGO_CONNECTION_STRING` can be found from your MongoDB cluster instance on [www.mongodb.com](https://www.mongodb.com/)

> The `AUTHORIZATION_TOKEN` can be any value you set as it acts as the authorization token for the secure backend APIs.

> The `NEXT_PUBLIC_API_BASE_URL` must be the URL of your deployment.

---

## 🏗️ Setting Up MongoDB Atlas (Online Instance)

1. Go to [https://www.mongodb.com/atlas/database](https://www.mongodb.com/atlas/database) and sign up or log in.
2. Create a **free shared cluster**.
3. Under **Database Access**, create a database user and set a password.
4. Under **Network Access**, allow access from your IP or anywhere (`0.0.0.0/0` for development).
5. In **Clusters**, click "Connect" and choose "Connect your application".
6. Copy the connection string and replace `<password>` and `<dbname>` in:
   ```
   mongodb+srv://<username>:<password>@<cluster-url>/<dbname>?retryWrites=true&w=majority
   ```

> Use this string as your `MONGO_CONNECTION_STRING` in `.env`.

---

## 🧭 Setting Up MongoDB Compass (GUI Tool)

1. Download MongoDB Compass: [https://www.mongodb.com/try/download/compass](https://www.mongodb.com/try/download/compass)
2. Open Compass and paste your **connection string** from MongoDB Atlas.
3. Click **Connect** to explore your database, collections, and documents visually.

---

## 📚 MongoDB Docs for JavaScript Developers

Refer to the official MongoDB driver documentation for Node.js here:  
🔗 [MongoDB Node.js Driver Docs](https://www.mongodb.com/docs/drivers/node/current/)

---

## 🚀 Running Locally

1. **Clone the repository:**

```bash
git clone https://github.com/MaclennanMah/MediQ.git
cd mediq
```

2. **Install dependencies:**

```bash
npm install
```

3. **Start MongoDB (if using local DB):**

```bash
mongod
```

4. **Start the frontend and backend server:**

```bash
npm run dev
```

5. **Access the application:**
   Visit `http://localhost:3000` (or your configured port)

---

## ☁️ How to Deploy the Application

You can deploy MediQ using services like Azure App Service, Heroku, or any Node-compatible host.

## 🚀 How to Deploy to Render (Frontend + Backend)

Render supports deploying both frontend and backend from the same repository.

### 📁 Project Structure

```
/mediq
  ├── frontend   # Next.js frontend app
  └── backend    # Express.js backend API
```

### 🔧 Step-by-Step Deployment Instructions

#### 1. Create a Render Account
Go to [https://render.com](https://render.com) and sign up or log in.

#### 2. Connect Your GitHub Repository
- Click **"New Web Service"** for the backend.
- Choose your repository and set the root directory to `backend/`.

##### Backend Service Settings:
- **Name**: `mediq-backend`
- **Root Directory**: `backend`
- **Environment**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm run start` (or your backend start script)
- **Environment Variables**:
  ```
  MONGO_CONNECTION_STRING=your-mongodb-uri
  AUTHORIZATION_TOKEN=your-token
  ```

#### 3. Deploy the Frontend (Static Site)
- Go back to your dashboard and click **"New Static Site"**
- Select the same repo and set the root directory to `frontend/`.

##### Frontend Service Settings:
- **Name**: `mediq-frontend`
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Publish Directory**: `.next`
- **Environment Variables**:
  ```
  NEXT_PUBLIC_API_BASE_URL=https://mediq-backend.onrender.com
  ```

> Be sure to replace the URL with the actual Render backend service URL.

#### 4. Add CORS Headers in Your Backend
Make sure your Express server allows requests from your frontend origin:

```js
app.use(require('cors')({
  origin: 'https://mediq-frontend.onrender.com'
}));
```

---

## 🔌 Backend API Documentation

You can find detailed API documentation and examples in the following Wiki pages:

- [Healthcare Organizations API](https://github.com/MaclennanMah/MediQ/wiki/Healthcare-Organization-API)
- [Wait Time Estimation API](https://github.com/MaclennanMah/MediQ/wiki/Wait-Time-Submissions-API)

> Update these links with your actual GitHub Wiki URLs if needed.

---

## 🛠 Maintainers

For issues or contributions, contact the developers below.
- **Jordan Purcell**: jpurcell1@myseneca.ca
- **Matthew MacLennan**: mmaclennan3@myseneca.ca
- **Hamza Teli**: hteli1@myseneca.ca
