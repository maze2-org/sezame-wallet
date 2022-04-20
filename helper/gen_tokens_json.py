from lib import coingecko
from lib.progressbar import progress
from lib.getblock import Contract as GetBlock
from lib.tokenscan import Contract as Tokenscan
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
    c = []
    for platform in coingecko_platforms:
        contract = coingecko_platforms[platform]
        try:
            if contract == '':
                raise Exception("Contract address is empty")
            print(f"####### Got contract {contract} on chain {chain[platform]}")
            tokenscan = Tokenscan(chain[platform])
            abi = json.loads(tokenscan.getabi(contract))
            getblock = GetBlock(chain[platform])
            decimal = getblock.getdecimals(contract, abi)
        except Exception as e:
            print(f"Got exception {e}")
            continue
            
        if platform in chain and coingecko_platforms[platform] != "":
            c.append ({ 
                    "id": chain[platform],
                    "name": platform,
                    "contract": coingecko_platforms[platform],
                    "decimal": decimal
                    })
    return c

tokens = []

for count, coin in enumerate(coins):
    
    details = coingecko.get_coin_details(coin["id"])

    token = {
        "id": coin["id"],
        "name": coin["name"],
        "symbol": coin["symbol"],
        "type": "coin",
        "chains": chain_from_platforms(coin["id"], details["platforms"]),
        "thumb": details["image"]["small"]
    }
 
    if token["chains"] != []:
        print(f"Adding {token}")
        tokens.append(token)
    else:
        print(f"NOT adding {token}")
    
    if count % 10 == 0:
        with open("tokens.json", "w") as t:
            json.dump(tokens, t, indent = 4)
    
    progress(count, coin_qt)
    
    
