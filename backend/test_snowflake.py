import snowflake.connector
import os
from dotenv import load_dotenv

load_dotenv()

conn = snowflake.connector.connect(
    user=os.getenv("SNOWFLAKE_USER"),
    password=os.getenv("SNOWFLAKE_PASSWORD"),

    account="YG65395.ca-central-1.aws", 
    warehouse="COMPUTE_WH",
    database="SNOWFLAKE_LEARNING_DB",
    schema="PUBLIC",
    role="ACCOUNTADMIN"
)

cur = conn.cursor()

# sanity check
cur.execute("SELECT CURRENT_ACCOUNT(), CURRENT_REGION()")
print(cur.fetchone())

# Cortex test
cur.execute("""
    SELECT SNOWFLAKE.CORTEX.COMPLETE(
        'claude-3-5-sonnet',
        'Say hello in one sentence.'
    )
""")
print(cur.fetchone()[0])

cur.close()
conn.close()
