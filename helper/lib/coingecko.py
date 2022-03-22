import requests
from time import sleep

base_url="https://api.coingecko.com/api/v3"

def _get_with_retry(request):
    r = requests.get(**request)
    wait = 10
    while r.status_code == 429:
        print(f"Got error code {r.status_code}, waiting {wait}s")
        sleep(wait)
        r = requests.get(**request)
    return r.json()


def get_coins_list():
    request = {
        "url": f"{base_url}/coins/list"
    }
    return _get_with_retry(request)

def get_coin_details(id):
    request = {
        "url": f"{base_url}/coins/{id}",
        "params": {
            "tickers": False,
            "market_data": False,
            "community_data": False,
            "developer_data": False,
            "sparkline": False
            }
    }
    return _get_with_retry(request)
    