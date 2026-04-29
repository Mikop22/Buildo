
<img width="1551" height="944" alt="Screenshot 2026-02-12 at 12 06 47 PM" src="https://github.com/user-attachments/assets/b26e4c5e-fc21-4040-8b2f-b205a465e0fc" />


# What is Buildo

Describe your hardware idea in plain English. Buildo gives you a visualization of your idea, a complete parts list that you can easily shop for, skeleton firmware code and step-by-step assembly instructions with images as well as a video demo. Everything you need to build it.

**If curious and don't want to setup** Check out our [Devpost](https://devpost.com/software/product-creator-temp-name-conu-x) for a demo and overview.

## Try for yourself

1. **Backend Environment**
   Create `backend/.env`:
   ```
   GEMINI_API_KEY=your_gemini_key
   SNOWFLAKE_USER=your_user
   SNOWFLAKE_PASSWORD=your_password
   SNOWFLAKE_WAREHOUSE=your_warehouse
   SNOWFLAKE_DATABASE=your_database
   ```

2. **Install Dependencies**

   Backend:
   ```bash
   cd backend
   uv sync
   ```

   Frontend:
   ```bash
   cd frontend
   npm install
   ```

### Run (3 terminals)

**Terminal 1 - Main Backend** (port 5000):
```bash
cd backend
python app.py
```

**Terminal 2 - Assembly Images Service** (port 5001):
```bash
cd backend/assembly-images-service
python app.py
```

**Terminal 3 - Frontend** (port 3000):
```bash
cd frontend
npm run dev
```

Open http://localhost:3000 and try it out :) 
