import os
import logging
from openai import AsyncOpenAI
from google.cloud import storage
from google.cloud import firestore
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

# OpenAI async client for better concurrency
openai_client = AsyncOpenAI(
    api_key=os.getenv('OPENAI_API_KEY')
)

# Google Cloud Storage client (optional)
gcs_client = None
if os.getenv('ENABLE_CONVERSATION_STORAGE', 'false').lower() == 'true':
    try:
        gcs_client = storage.Client(project=os.getenv('GOOGLE_CLOUD_PROJECT'))
    except Exception as e:
        logger.warning(f"Could not initialize GCS client: {e}")
        gcs_client = None

# Firestore client for conversation storage
firestore_client = None
try:
    firestore_client = firestore.Client(
        project=os.getenv('GOOGLE_CLOUD_PROJECT'),
        database=os.getenv('FIRESTORE_DATABASE', '(default)')
    )
    logger.info(f"Firestore client initialized successfully (database: {os.getenv('FIRESTORE_DATABASE', '(default)')})")
except Exception as e:
    logger.warning(f"Could not initialize Firestore client: {e}")
    logger.info("Falling back to in-memory conversation storage")
    firestore_client = None