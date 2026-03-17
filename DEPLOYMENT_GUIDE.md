# Deployment Guide for NeuroScan AI

This guide covers deploying the Brain Tumor Detection API to cloud platforms.

## Table of Contents
1. [Model File Setup](#model-file-setup)
2. [Docker Deployment](#docker-deployment)
3. [Platform-Specific Instructions](#platform-specific-instructions)

---

## Model File Setup

The `brain_tumor_detection_model.keras` file is 158 MB and cannot be stored in Git (GitHub limit: 100 MB).

### Option 1: Docker Deployment (Easiest)
The `Dockerfile` includes the model file directly. Just push the code with the model to a Docker registry.

```bash
docker build -t neuroscan-ai:latest .
docker run -p 8080:8080 neuroscan-ai:latest
```

### Option 2: Cloud Storage + ENV Variable
Upload the model to cloud storage and configure the download URL.

#### Step 1: Upload Model to Cloud Storage

Choose one:

**GitHub Releases** (Free, easy)
1. Go to your repo → Releases → Create new release
2. Upload `brain_tumor_detection_model.keras` as an asset
3. Copy the download link (e.g., `https://github.com/YOUR_USER/YOUR_REPO/releases/download/v1/brain_tumor_detection_model.keras`)

**Hugging Face Model Hub** (Free, ML-focused)
1. Create account at https://huggingface.co
2. Create a new model repo
3. Upload `brain_tumor_detection_model.keras` using git-lfs
4. Copy raw file link (right-click → copy link)

**AWS S3** (Pay-as-you-go)
1. Create S3 bucket
2. Upload model file
3. Make it public (or use presigned URLs)
4. Copy object URL

**Azure Blob Storage** (Pay-as-you-go)
1. Create storage account & container
2. Upload model file
3. Generate SAS token
4. Copy SAS URL

#### Step 2: Set Environment Variable on Platform

On your deployment platform (Railway, Koyeb, Render, etc.):

Navigate to Environment Variables / Secrets and add:
```
MODEL_URL=https://your-storage-url/brain_tumor_detection_model.keras
```

The app will automatically download on startup if the file is missing.

#### Step 3: Deploy

Redeploy your application. Check logs for:
```
✅ Model file found: /app/brain_tumor_detection_model.keras (158.3 MB)
✅ Model loaded successfully!
```

---

## Docker Deployment

### Build Locally
```bash
# Navigate to project directory
cd Brain_Tumor_Detection

# Build image
docker build -t neuroscan-ai:latest .

# Run container
docker run -p 8080:8080 neuroscan-ai:latest

# Test
curl http://localhost:8080/health/model
```

### Deploy to Docker Registry

**Docker Hub**
```bash
docker tag neuroscan-ai:latest YOUR_DOCKERHUB_USER/neuroscan-ai:latest
docker push YOUR_DOCKERHUB_USER/neuroscan-ai:latest
```

**GitHub Container Registry**
```bash
docker tag neuroscan-ai:latest ghcr.io/YOUR_USER/neuroscan-ai:latest
docker push ghcr.io/YOUR_USER/neuroscan-ai:latest
```

---

## Platform-Specific Instructions

### Railway

1. **Push code to GitHub** (including `Dockerfile` and model file)
2. **Connect GitHub repo** to Railway
3. **Select Dockerfile** as deployment method
4. **Set environment variable** (if using cloud storage):
   - Go to Variables
   - Add `MODEL_URL=https://...`
5. **Deploy** - Railway auto-builds and runs Dockerfile

**Status Check**
```bash
curl https://YOUR_RAILWAY_APP_URL/health/model
```

### Render

1. **Create Web Service** from GitHub repo
2. **Select Docker** as environment
3. **Configure**:
   - Build Command: `docker build -t neuroscan-ai .`
   - Start Command: Leave blank (use Dockerfile CMD)
4. **Add environment variable** (if needed):
   - Go to Environment
   - Add `MODEL_URL`
5. **Deploy**

### Fly.io

1. **Initialize**:
   ```bash
   fly auth login
   fly launch
   ```

2. **Edit `fly.toml`**:
   - Select CPU: `shared`
   - Memory: `1GB` minimum
   - Processes: `web`

3. **Set secret** (if using cloud storage):
   ```bash
   fly secrets set MODEL_URL=https://...
   ```

4. **Deploy**:
   ```bash
   fly deploy
   ```

### Google Cloud Run

1. **Push to GitHub / GitLab**
2. **Cloud Run Dashboard**:
   - Create Service
   - Select GitHub repository
   - Select Docker build
   - Set region (us-central1, europe-west1, etc.)

3. **Environment Variables**:
   - Go to Connections → Runtime settings
   - Add `MODEL_URL` if using cloud storage

4. **Deploy**

### Koyeb

1. **Connect GitHub account**
2. **Create Service** from repository
3. **Select Docker build**
4. **Environment**:
   - Add `MODEL_URL` variable if needed
5. **Deploy**

---

## Troubleshooting

### "File is not a zip file"
- Model file is corrupted or missing on platform
- **Solution**: Set `MODEL_URL` env var correctly and redeploy

### "libGL.so.1: cannot open shared object file"
- Wrong OpenCV package deployed
- **Solution**: Use `opencv-python-headless` (already in requirements.txt)

### "Model not loaded"
- Check app logs
- Verify `/health/model` endpoint:
  ```bash
  curl https://YOUR_APP_URL/health/model
  ```
- Shows: `{"loaded": false, "error": "..."}`

### Download Timeout
- Model file is too large (158 MB)
- **Solution**: Increase timeout in Procfile/Dockerfile
  - Currently: `--timeout 180` (3 minutes)
  - Increase if needed: `--timeout 300`

---

## Performance Tips

1. **Use Docker** if you want the fastest, most reliable deployment
2. **Use cloud storage + ENV var** if you prefer simpler platform configuration
3. **Cold start time**: ~30-40 seconds (model loading)
   - First request may timeout on free tiers
   - Consider upgrading to paid or keeping app warm

---

## Verification

After deployment, verify all endpoints:

```bash
# Health check
curl https://YOUR_APP_URL/health/model

# Home page
curl https://YOUR_APP_URL/

# Test prediction (requires MRI image)
# Upload via predict.html UI or POST to /predict
```

Expected response from `/health/model`:
```json
{
  "loaded": true,
  "error": null,
  "model_path": "/app/brain_tumor_detection_model.keras"
}
```

---

## Questions?

- Check deployment logs for detailed error messages
- Verify MODEL_URL is accessible: `curl https://your-model-url.com/brain_tumor_detection_model.keras`
- Ensure model file is exactly 158 MB
