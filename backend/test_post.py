import requests
import json

if __name__ == "__main__":
    url = "http://localhost:5000/generate"
    data = {"description": "test device description"}
    response = requests.post(url, json=data)
    print(json.dumps(response.json(), indent=2))
