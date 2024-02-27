// walletUtils.ts

import {WalletGenerator, Chains} from '@maze2/sezame-sdk';
import {WalletDescription} from '@maze2/sezame-sdk/dist/utils/types/WalletDescription';
import {CurrentWallet, IWalletAsset} from 'models';

export async function addDerivedAddress(
  currentWalletStore: CurrentWallet,
  asset: IWalletAsset,
  group?: 1 | 2 | 3 | 0,
): Promise<void> {
  let result: WalletDescription | null = null;
  if (asset && currentWalletStore) {
    const indexUsed: number[] = [asset.index || 0];
    for (const derived of asset.derivedAddresses) {
      indexUsed.push(derived.index || 0);
    }

    result = await WalletGenerator.generateKeyPairFromMnemonic(
      `${currentWalletStore.mnemonic}`,
      asset.chain as Chains,
      0,
      indexUsed,
      group,
    );
  }

  if (asset && result) {
    await currentWalletStore.addDerivedAddress(asset, {
      address: result.address,
      balance: 0,
      freeBalance: 0,
      privateKey: result.privateKey,
      publicKey: result.publicKey,
      rate: asset.rate,
      stakedBalance: 0,
      unconfirmedBalance: 0,
      unlockedBalance: 0,
      unstakedBalance: 0,
      value: 0,
      version: 1,
      derivationIndex: 1,
      index: result.index || 0,
      group: `${result.group}`,
    });
  }
}
