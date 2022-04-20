from matplotlib.pyplot import cla
import requests
from time import sleep
import json
from web3 import Web3


getblock_apikey = "a2bd0653-48b7-4531-b4c2-c56c5cc2e925"

chainlist = {
    "BSC": {
        "base_url": f"https://bsc.getblock.io/mainnet/?api_key={getblock_apikey}"
    },
    "POLYGON": {
        "base_url": f"https://matic.getblock.io/mainnet/?api_key={getblock_apikey}"
    },
    "ETH": {
        "base_url": f"https://eth.getblock.io/mainnet/?api_key={getblock_apikey}"
    }
}

class Contract:

    def __init__(self, chain):
        self.params = {"module": "contract"}
        self.base_url = chainlist[chain]["base_url"]

    def getdecimals(self, contract, abi):
        w3 = Web3(Web3.HTTPProvider(self.base_url))
        contract_instance = w3.eth.contract(address=Web3.toChecksumAddress(contract), abi=abi)
        return contract_instance.functions.decimals().call()
