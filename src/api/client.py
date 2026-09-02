import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("API_FOOTBALL_KEY")
BASE_URL = os.getenv("API_FOOTBALL_BASE_URL") or os.getenv("BASE_URL")


class FootballAPI:
    def __init__(self):
        self.headers = {
            "x-apisports-key": API_KEY
        }

    def get(self, endpoint, params=None):
        url = f"{BASE_URL}/{endpoint}"

        response = requests.get(
            url,
            headers=self.headers,
            params=params
        )

        response.raise_for_status()

        return response.json()


api = FootballAPI()