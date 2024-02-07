import {WalletFactory} from '@maze2/sezame-sdk';
import {asCreateObservableOptions} from 'mobx/dist/internal';
import {BaseWalletDescription, IWalletAsset} from 'models';
export type CryptoTransaction = {
  date: Date | null;
  timestamp: number;
  out: boolean;
  hash: string;
  from: string[] | string;
  to: string[] | string;
  amount: string;
  status?: string | null;
  reason?: 'transaction' | 'staking' | 'unstaking' | 'withdraw';
};

const tokens = require('@config/tokens.json');

export type AssetBalance = {
  confirmedBalance: number;
  unconfirmedBalance: number;
  stakedBalance?: number;
  unlockedBalance?: number;
  unstakedBalance?: number;
  freeBalance?: number;
};

const getWallet = (asset: BaseWalletDescription) => {
  const cryptoWallet = WalletFactory.getWallet({
    ...asset,
    contract: asset.contract ? asset.contract : null,
    walletAddress: asset.address,
    privKey: asset.privateKey,
    pubKey: asset.publicKey,
  });

  return cryptoWallet;
};
export const getBalance = async (
  asset: BaseWalletDescription,
): Promise<AssetBalance> => {
  const tokenInfo = tokens.find(token => token.id === asset.cid);
  const assetInfo = tokenInfo.chains.find(chain => chain.id === asset.chain);
  asset.decimals = assetInfo.decimals;

  const cryptoWallet = getWallet(asset);
  const balance = await cryptoWallet.getBalance();

  return balance;
};

export const getTransactionsUrl = (asset: IWalletAsset) => {
  const cryptoWallet = getWallet(asset);
  const url = cryptoWallet.getTransactionsUrl(cryptoWallet.address);
  return url;
};

export const getAddressGroup = (asset: IWalletAsset, address?: string) => {
  const cryptoWallet = getWallet(asset);
  const url = cryptoWallet.getAddressGroup(address ?? asset.address);
  return url;
};

export const getTransactionStatus = (
  asset: BaseWalletDescription,
  txId: string,
) => {
  console.log('Starting to get transaction status of', asset, txId);
  const cryptoWallet = getWallet(asset);
  return cryptoWallet.getTransactionStatus(txId);
};

export const getTransactions = async (
  asset: BaseWalletDescription,
): Promise<Array<CryptoTransaction>> => {
  const cryptoWallet = getWallet(asset);
  return await cryptoWallet.getTransactions();
};

export const getFees = async (
  asset: BaseWalletDescription,
  address: string,
  amount: number,
  reason?: 'transfer' | 'staking' | 'unstaking' | 'lowering' | 'lifting',
) => {
  const cryptoWallet = getWallet(asset);
  const fees = await cryptoWallet.getTxSendProposals(address, amount, reason);
  return fees;
};
export const getTransactionDriver = async (asset: BaseWalletDescription) => {
  const cryptoWallet = getWallet(asset);
  const driver =
    cryptoWallet.TRANSACTION_DRIVER_NAMESPACE[asset.chain + '_Driver'];
  return driver;
};
export const makeSendTransaction = (
  asset: BaseWalletDescription,
  proposal: any,
) => {
  const cryptoWallet = getWallet(asset);
  return cryptoWallet.postTxSend(proposal);
};

export const makeStakeTransaction = (
  asset: BaseWalletDescription,
  proposal: any,
) => {
  const cryptoWallet = getWallet(asset);
  return cryptoWallet.stake(proposal);
};

export const makeUnstakeTransaction = (
  asset: BaseWalletDescription,
  proposal: any,
) => {
  const cryptoWallet = getWallet(asset);
  return cryptoWallet.unstake(proposal);
};

export const makeWithdrawal = (asset: BaseWalletDescription) => {
  const cryptoWallet = getWallet(asset);
  return cryptoWallet.withdrawUnlocked();
};

export const getStakingProperties = (asset: BaseWalletDescription) => {
  const cryptoWallet = getWallet(asset);
  return cryptoWallet.getStakingProperties(asset.address);
};

export const makeRawTransaction = async (
  asset: BaseWalletDescription,
  data: any,
) => {
  const driver = await getTransactionDriver(asset);
  const rawTransaction = await driver.prepareSignedTransaction(data);
  return rawTransaction;
};
export const sendRawTransaction = async (
  asset: IWalletAsset,
  rawTransaction: any,
) => {
  const driver = await getTransactionDriver(asset);
  const hash = await driver.sendRaw(rawTransaction);
  return hash;
};
