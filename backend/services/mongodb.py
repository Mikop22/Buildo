"""
Upload parts_catalog.json to MongoDB Atlas.
Creates indexes for fast category/subcategory lookups
"""

import json
import os
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, OperationFailure

# Load .env file
load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = "buildo"
COLLECTION_NAME = "parts_catalog"

def sync_parts_to_mongodb():
    """Sync parts from JSON file to MongoDB Atlas - only adds/updates new parts."""
    
    if not MONGODB_URI:
        print("ERROR: MONGODB_URI not found in environment variables.")
        print("\nTo get your MongoDB URI:")
        print("1. Go to MongoDB Atlas dashboard")
        print("2. Click 'Connect' on your cluster")
        print("3. Choose 'Connect your application'")
        print("4. Copy the connection string")
        print("5. Add to backend/.env: MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority")
        return False
    
    # Load JSON file (go up one level from services/ to backend/)
    json_path = os.path.join(os.path.dirname(__file__), "..", "parts_catalog.json")
    json_path = os.path.abspath(json_path)
    print(f"Loading parts from {json_path}...")
    
    try:
        with open(json_path, "r", encoding="utf-8") as f:
            json_parts = json.load(f)
        print(f"✓ Loaded {len(json_parts)} parts from JSON")
    except FileNotFoundError:
        print(f"ERROR: Could not find {json_path}")
        return False
    except json.JSONDecodeError as e:
        print(f"ERROR: Invalid JSON in {json_path}: {e}")
        return False
    
    # Connect to MongoDB
    print(f"\nConnecting to MongoDB Atlas...")
    try:
        client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
        # Test connection
        client.admin.command('ping')
        print("✓ Connected to MongoDB Atlas")
    except ConnectionFailure:
        print("ERROR: Could not connect to MongoDB Atlas")
        print("Check your MONGODB_URI and network connection")
        return False
    
    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]
    
    # Create indexes for fast lookups (idempotent - safe to run multiple times)
    print(f"\nEnsuring indexes exist...")
    try:
        collection.create_index([("category", 1), ("subcategory", 1)])
        collection.create_index("category")
        collection.create_index("subcategory")
        collection.create_index("url", unique=True)  # URL is unique per part
        print("✓ Indexes ready")
    except OperationFailure as e:
        print(f"⚠ Warning: Could not create indexes: {e}")
        print("(This is okay - queries will still work, just slower)")
    
    # Get existing parts from MongoDB (use URL as unique identifier)
    print(f"\nChecking existing parts in MongoDB...")
    existing_urls = set()
    try:
        existing_parts = collection.find({}, {"url": 1})
        existing_urls = {part["url"] for part in existing_parts if part.get("url")}
        print(f"✓ Found {len(existing_urls)} existing parts in MongoDB")
    except Exception as e:
        print(f"⚠ Warning: Could not read existing parts: {e}")
        existing_urls = set()
    
    # Find new parts and parts to update
    new_parts = []
    updated_parts = []
    json_parts_by_url = {}
    
    for part in json_parts:
        url = part.get("url")
        if not url:
            continue  # Skip parts without URL
        
        json_parts_by_url[url] = part
        
        if url not in existing_urls:
            new_parts.append(part)
        else:
            # Check if part data changed (compare full document)
            existing_part = collection.find_one({"url": url})
            if existing_part:
                # Remove MongoDB _id for comparison
                existing_part.pop("_id", None)
                # Compare as JSON strings for simplicity
                if json.dumps(existing_part, sort_keys=True) != json.dumps(part, sort_keys=True):
                    updated_parts.append(part)
    
    print(f"\nSync summary:")
    print(f"  New parts to add: {len(new_parts)}")
    print(f"  Parts to update: {len(updated_parts)}")
    print(f"  Unchanged parts: {len(existing_urls) - len(updated_parts)}")
    
    # Insert new parts in batches
    if new_parts:
        batch_size = 1000
        total_batches = (len(new_parts) + batch_size - 1) // batch_size
        print(f"\nInserting {len(new_parts)} new parts in {total_batches} batches...")
        
        for i in range(0, len(new_parts), batch_size):
            batch = new_parts[i:i + batch_size]
            batch_num = (i // batch_size) + 1
            
            try:
                collection.insert_many(batch, ordered=False)
                print(f"✓ Inserted batch {batch_num}/{total_batches} ({len(batch)} parts)")
            except Exception as e:
                print(f"⚠ Warning: Error inserting batch {batch_num}: {e}")
                # Continue with other batches even if one fails
    
    # Update existing parts
    if updated_parts:
        print(f"\nUpdating {len(updated_parts)} changed parts...")
        updated_count = 0
        for part in updated_parts:
            try:
                collection.replace_one({"url": part["url"]}, part, upsert=False)
                updated_count += 1
            except Exception as e:
                print(f"⚠ Warning: Error updating part {part.get('url', 'unknown')}: {e}")
        
        print(f"✓ Updated {updated_count} parts")
    
    # Verify final count
    total_count = collection.count_documents({})
    print(f"\n✓ Sync complete!")
    print(f"  Total parts in MongoDB: {total_count}")
    print(f"  Database: {DB_NAME}")
    print(f"  Collection: {COLLECTION_NAME}")
    
    # Show sample query
    print(f"\nSample query test:")
    sample = collection.find_one({"category": "Microcontrollers", "subcategory": "ESP"})
    if sample:
        print(f"  Found: {sample.get('name', 'Unknown')[:50]}...")
    
    client.close()
    return True

def upload_parts_to_mongodb():
    """Legacy function name - calls sync_parts_to_mongodb() for backwards compatibility."""
    return sync_parts_to_mongodb()

if __name__ == "__main__":
    print("=" * 60)
    print("MongoDB Atlas Parts Sync Script")
    print("=" * 60)
    print("\nThis script syncs parts_catalog.json to MongoDB Atlas.")
    print("Only new/changed parts will be added/updated.")
    print("Safe to run multiple times - idempotent.\n")
    
    success = sync_parts_to_mongodb()
    
    if success:
        print("\n" + "=" * 60)
        print("✓ SUCCESS: Parts synced to MongoDB Atlas")
        print("=" * 60)
        print("\nNOTE: parts_storing.py still uses JSON file.")
        print("MongoDB is ready for future use.")
    else:
        print("\n" + "=" * 60)
        print("✗ FAILED: Sync did not complete")
        print("=" * 60)
