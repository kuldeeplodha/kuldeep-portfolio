import os
import json
import uuid
import datetime
import asyncio
from libsql_client import create_client

async def init_schema(client):
    schema_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "backend", "migrations", "0001_initial_schema.sql")
    if os.path.exists(schema_path):
        with open(schema_path) as f:
            schema = f.read()
            statements = [s.strip() for s in schema.split(';') if s.strip()]
            for statement in statements:
                await client.execute(statement)
        print("Schema initialized.")
    else:
        print("Warning: initial schema file not found.")

async def main():
    print("Kuldeep Portfolio - Direct Case Studies Migration Script")
    url = os.getenv("TURSO_DATABASE_URL", "")
    token = os.getenv("TURSO_AUTH_TOKEN", "")
    
    if not url:
        print("Error: TURSO_DATABASE_URL is required.")
        return
        
    if url.startswith("libsql://"):
        url = url.replace("libsql://", "https://", 1)
    elif url.startswith("wss://"):
        url = url.replace("wss://", "https://", 1)
        
    client = create_client(url, auth_token=token)
    
    await init_schema(client)

    case_studies = [
        {
            "slug": "gesture-recognition",
            "title": "Gesture Recognition Using Neural Networks",
            "category": "Machine Learning · Deep Learning",
            "featured": 1,
            "period": "Oct '23 – Nov '23",
            "summary": "Developed a deep learning system for recognizing hand gestures using convolutional and recurrent neural networks.",
            "problem": "Classify hand gestures from time-series and image-based data.",
            "context": "Built data preprocessing, model training, and evaluation workflows for image and sequential data.",
            "architecture": "Pipeline: Data -> Preprocessing -> Feature Representation -> CNN/RNN -> Training -> Evaluation -> Prediction",
            "technologies": ["Python", "TensorFlow", "Keras", "CNN", "RNN"],
            "outcome": "Explored how CNN and RNN architectures can be combined with appropriate data representations for gesture recognition.",
            "future_improvements": "Add real-time webcam inference and expand the gesture vocabulary with transfer learning.",
            "relevant_roles": ["ai", "system"],
            "subtitle": "",
            "client_or_org": "",
            "github_url": None,
            "live_url": None,
            "featured_media_url": None,
            "media_urls": []
        },
        {
            "slug": "ticket-classification",
            "title": "Automatic Ticket Classification",
            "category": "NLP · Machine Learning",
            "featured": 0,
            "period": "Dec '23 – Jan '24",
            "summary": "Built an NLP-based classification system to automatically categorize support tickets from their textual content.",
            "problem": "Manual ticket categorization is slow and inconsistent.",
            "context": "Applied text preprocessing, feature extraction, and supervised machine learning to transform unstructured support-ticket text into useful categories.",
            "architecture": "Pipeline: Raw Ticket -> Text Preprocessing -> Feature Extraction -> ML Model -> Classification -> Ticket Category",
            "technologies": ["Python", "Scikit-learn", "NLP", "Text Classification"],
            "outcome": "Demonstrated how NLP can automate repetitive ticket categorization and improve support workflow efficiency.",
            "future_improvements": "",
            "relevant_roles": ["ai", "system"],
            "subtitle": "",
            "client_or_org": "",
            "github_url": None,
            "live_url": None,
            "featured_media_url": None,
            "media_urls": []
        },
        {
            "slug": "sentiment-recommendation",
            "title": "Sentiment-Based Product Recommendation System",
            "category": "NLP · Recommendation Systems",
            "featured": 0,
            "period": "Apr '24 – May '24",
            "summary": "Built a recommendation system that incorporates sentiment extracted from customer reviews to make product recommendations more personalized.",
            "problem": "",
            "context": "Developed sentiment-analysis and recommendation workflows using machine learning and NLP techniques.",
            "architecture": "Pipeline: Customer Review -> Sentiment Analysis -> Preference Signal -> Recommendation -> Personalized Product Suggestion",
            "technologies": ["Python", "Scikit-learn", "TensorFlow", "NLP", "Sentiment Analysis"],
            "outcome": "Explored how customer sentiment can become an additional signal for improving recommendation relevance.",
            "future_improvements": "",
            "relevant_roles": ["ai", "system"],
            "subtitle": "",
            "client_or_org": "",
            "github_url": None,
            "live_url": None,
            "featured_media_url": None,
            "media_urls": []
        }
    ]
    
    created = 0
    skipped = 0
    
    date_str = datetime.datetime.utcnow().isoformat() + "Z"
    
    for cs in case_studies:
        slug = cs["slug"]
        
        # Check if slug exists
        res = await client.execute("SELECT id FROM case_studies WHERE slug = ?", [slug])
        if res.rows:
            # We can upsert or skip. Instruction says "Idempotent upsert-by-slug".
            cs_id = res.rows[0][0]
            try:
                await client.execute(
                    """UPDATE case_studies SET 
                    title = ?, subtitle = ?, summary = ?, client_or_org = ?, period = ?, category = ?, status = ?, featured = ?, updated_at = ?, technologies = ?, relevant_roles = ?, problem = ?, context = ?, architecture = ?, outcome = ?, future_improvements = ?, github_url = ?, live_url = ?, featured_media_url = ?, media_urls = ?
                    WHERE id = ?""",
                    [cs["title"], cs["subtitle"], cs["summary"], cs["client_or_org"], cs["period"], cs["category"], "published", cs["featured"], date_str, json.dumps(cs["technologies"]), json.dumps(cs["relevant_roles"]), cs["problem"], cs["context"], cs["architecture"], cs["outcome"], cs["future_improvements"], cs["github_url"], cs["live_url"], cs["featured_media_url"], json.dumps(cs["media_urls"]), cs_id]
                )
                print(f"Successfully updated: {slug}")
                created += 1
            except Exception as e:
                print(f"Failed to update {slug}: {e}")
        else:
            post_id = str(uuid.uuid4())
            try:
                await client.execute(
                    """INSERT INTO case_studies 
                    (id, slug, title, subtitle, summary, client_or_org, period, category, status, featured, published_at, created_at, updated_at, technologies, relevant_roles, problem, context, architecture, outcome, future_improvements, github_url, live_url, featured_media_url, media_urls) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    [post_id, slug, cs["title"], cs["subtitle"], cs["summary"], cs["client_or_org"], cs["period"], cs["category"], "published", cs["featured"], date_str, date_str, date_str, json.dumps(cs["technologies"]), json.dumps(cs["relevant_roles"]), cs["problem"], cs["context"], cs["architecture"], cs["outcome"], cs["future_improvements"], cs["github_url"], cs["live_url"], cs["featured_media_url"], json.dumps(cs["media_urls"])]
                )
                print(f"Successfully migrated: {slug}")
                created += 1
            except Exception as e:
                print(f"Failed to migrate {slug}: {e}")
            
    await client.close()
    print(f"\nMigration complete. Processed: {created}, Skipped: {skipped}")

if __name__ == "__main__":
    asyncio.run(main())
