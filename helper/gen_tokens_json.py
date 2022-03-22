from lib import coingecko
from lib.progressbar import progress
import json

with open("overrides.json") as f:
    overrides = json.load(f)

chain = {
        "ethereum": "ETH",
        "binance-smart-chain": "BSC",
        "polygon-pos": "POLYGON",
        "bitcoin": "BTC",
        "alephium": "ALPH",
        "aventus": "AVN"
    }

coins = coingecko.get_coins_list()
coin_qt = len(coins)

print(f"Found {coin_qt} coins")

def chain_from_platforms(id, coingecko_platforms):
    print(f"Platform {coingecko_platforms}")
    try:
        return [
               { 
                "id": chain[platform],
                "name": platform,
                "contract": None,
                } 
               for platform in overrides[id]["platforms"]
            ]
    except KeyError:
        try:
            return [ 
                    { 
                     "id": chain[platform],
                     "name": platform,
                     "contract": coingecko_platforms[platform],
                     } 
                    for platform in coingecko_platforms if platform in chain 
                    ]
        except (KeyError, ValueError):
            return []
             
def get_capabilities(id):
    try:
        return overrides[id]
    except KeyError:
        return []

tokens = []

for count, coin in enumerate(coins):
    
    details = coingecko.get_coin_details(coin["id"])

    token = {
        "id": coin["id"],
        "name": coin["name"],
        "symbol": coin["symbol"],
        "type": "coin",
        "chains": chain_from_platforms(coin["id"], details["platforms"]),
        "capabilities": get_capabilities(coin["id"]),
        "thumb": details["image"]["small"]
    }
    
    print(token)
    
    if token["chains"] != []:
        tokens.append(token)
    
    if count % 10 == 0:
        with open("tokens.json", "w") as t:
            json.dump(tokens, t, indent = 4)
    
    progress(count, coin_qt)
    
    
