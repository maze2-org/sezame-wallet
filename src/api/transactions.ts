import SignClient from "@walletconnect/sign-client"
import { ALPH } from "@alephium/token-list"
import { CallContractTxData } from "types/transactions.ts"
import { DUST_AMOUNT, transactionSign } from "@alephium/web3"

import { client } from "../../packages/shared/src/api/client.ts"

export const getTransactionAssetAmounts = (assetAmounts: any[]) => {
  const alphAmount =
    assetAmounts.find(asset => asset.id === ALPH.id)?.amount ?? BigInt(0);
  const tokens = assetAmounts
    .filter(
      (asset): asset is Required<any> =>
        asset.id !== ALPH.id && asset.amount !== undefined,
    )
    .map(asset => ({id: asset.id, amount: asset.amount.toString()}));

  const minAlphAmountRequirement = DUST_AMOUNT * BigInt(tokens.length);
  const minDiff = minAlphAmountRequirement - alphAmount;
  const totalAlphAmount = minDiff > 0 ? alphAmount + minDiff : alphAmount;

  return {
    attoAlphAmount: totalAlphAmount.toString(),
    tokens,
  };
};

export const getOptionalTransactionAssetAmounts = (assetAmounts?: any[]) =>
  assetAmounts
    ? getTransactionAssetAmounts(assetAmounts)
    : {attoAlphAmount: undefined, tokens: undefined};

export const buildCallContractTransaction = async (
  {
    fromAddress,
    bytecode,
    assetAmounts,
    gasAmount,
    gasPrice,
  }: CallContractTxData,
  currentWalletStore: any,
) => {
  const {attoAlphAmount, tokens} =
    getOptionalTransactionAssetAmounts(assetAmounts);
  const {getAssetById} = currentWalletStore;
  const asset = getAssetById('alephium', 'ALPH');

  const address = asset?.derivedAddresses?.find(
    (add: any) => add.address === fromAddress,
  );
  const fromPublicKey = address?.publicKey;

  console.log('BUILDING TX.........................................................');
  return await client.node.contracts.postContractsUnsignedTxExecuteScript({
    fromPublicKey: fromPublicKey || '',
    bytecode,
    attoAlphAmount,
    tokens,
    gasAmount: gasAmount,
    gasPrice: gasPrice?.toString(),
  });
};

export const signAndSendTransaction = async (
  fromAddress: any,
  txId: string,
  unsignedTx: string,
  currentWalletStore: any,
) => {
  const {getAssetById} = currentWalletStore;
  const asset = getAssetById('alephium', 'ALPH');
  const address = asset?.derivedAddresses?.find(
    (add: any) => add.address === fromAddress,
  );
  const fromPublicKey = address?.privateKey;

  const signature = transactionSign(txId, fromPublicKey || '');
  const data = await client.node.transactions.postTransactionsSubmit({
    unsignedTx,
    signature,
  });

  return {...data, signature};
};

export const getActiveWalletConnectSessions = (
  walletConnectClient?: SignClient,
) => {
  if (!walletConnectClient) return [];
  const activePairings = walletConnectClient.core.pairing
    .getPairings()
    .filter(pairing => pairing.active);

  return walletConnectClient.session.values.filter(session =>
    activePairings.some(pairing => pairing.topic === session.pairingTopic),
  );
};
