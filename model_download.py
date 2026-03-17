"""
Model download utility for deployment environments.
Downloads the brain tumor detection model if not present locally.
"""

import os
import urllib.request
import sys

MODEL_FILENAME = "brain_tumor_detection_model.keras"
MODEL_SIZE_MB = 158

# Configure your model hosting URL here
# Option 1: Use a free service like Hugging Face, GitHub Releases, or Google Drive
# Option 2: Upload to AWS S3, Azure Blob, or similar cloud storage
MODEL_DOWNLOAD_URL = os.environ.get(
    "MODEL_URL",
    ""  # Leave empty and implement one of the options below
)


def download_model(url: str, output_path: str) -> bool:
    """Download the model file from URL to output_path."""
    if not url:
        print("❌ MODEL_URL environment variable not set.")
        print("\nTo enable auto-download on deployment, set MODEL_URL to your hosted model file URL.")
        print("\nOptions:")
        print("  1. Hugging Face Model Hub: https://huggingface.co/docs/hub/models-uploading")
        print("  2. GitHub Releases: Upload to your repo's Releases section")
        print("  3. Cloud Storage: AWS S3, Azure Blob Storage, Google Cloud Storage")
        return False

    try:
        print(f"📥 Downloading model from: {url}")
        
        # Show progress
        def download_progress(block_num, block_size, total_size):
            downloaded = block_num * block_size
            percent = min(downloaded * 100 / total_size, 100)
            sys.stdout.write(f"\r  Progress: {percent:.1f}% ({downloaded / 1024 / 1024:.1f}MB / {total_size / 1024 / 1024:.1f}MB)")
            sys.stdout.flush()
        
        urllib.request.urlretrieve(url, output_path, download_progress)
        print("\n✅ Model downloaded successfully!")
        return True
    
    except Exception as e:
        print(f"\n❌ Model download failed: {e}")
        return False


def ensure_model_exists(model_path: str = MODEL_FILENAME) -> bool:
    """Check if model exists; if not, attempt download."""
    if os.path.exists(model_path):
        size_mb = os.path.getsize(model_path) / (1024 * 1024)
        print(f"✅ Model file found: {model_path} ({size_mb:.1f} MB)")
        return True
    
    print(f"⚠️ Model file not found: {model_path}")
    
    if MODEL_DOWNLOAD_URL:
        return download_model(MODEL_DOWNLOAD_URL, model_path)
    else:
        print("\nManual setup required:")
        print(f"  1. Place '{model_path}' in the project root directory, or")
        print(f"  2. Upload model to cloud storage and set MODEL_URL environment variable")
        return False


if __name__ == "__main__":
    ensure_model_exists()
