from matplotlib.pyplot import cla
import requests
from time import sleep


getblock_apikey = "a2bd0653-48b7-4531-b4c2-c56c5cc2e925"

chainlist = {
    "BSC": {
        "base_url": "https://api.bscscan.com/api"
    },
    "POLYGON": {
        "base_url": "https://api.polygonscan.com/api"
    },
    "ETH": {
        "base_url": "https://api.etherscan.io/api"
    }
}

info = { 
    "ETH": f"https://eth.getblock.io/mainnet/?api_key={getblock_apikey}"
}


def _get_with_retry(request):
    r = requests.get(**request)
    result = r.json()["result"]
    while result == 'Max rate limit reached, please use API Key for higher rate limit':
        wait = 5
        print(f"Got result '{result}', waiting {wait}s, with {r.url}")
        sleep(wait)
        r = requests.get(**request)
        result = r.json()["result"]
    return r.json()

class Contract:

    def __init__(self, chain):
        self.params = {"module": "contract"}
        self.base_url = chainlist[chain]["base_url"]

    def getabi(self, contract):
        self.params["action"] = "getabi"
        self.params["address"] = contract
        request = {
            "url": f"{self.base_url}",
            "params": self.params
        }
        result = _get_with_retry(request)["result"]
        if result == 'Contract source code not verified':
            raise Exception("Contract source code not verified")
        return result
