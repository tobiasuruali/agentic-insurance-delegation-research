import os
from openai import OpenAI
from google.cloud import storage
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# OpenAI client
openai_client = OpenAI(
    api_key=os.getenv('OPENAI_API_KEY')
)

# Google Cloud Storage client (optional)
gcs_client = None
if os.getenv('ENABLE_CONVERSATION_STORAGE', 'false').lower() == 'true':
    try:
        gcs_client = storage.Client(project=os.getenv('GOOGLE_CLOUD_PROJECT'))
    except Exception as e:
        print(f"Warning: Could not initialize GCS client: {e}")
        gcs_client = None