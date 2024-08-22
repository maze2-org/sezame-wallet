import {NetworkType} from 'config/networks';
import {flow, Instance, SnapshotOut, types} from 'mobx-state-tree';
import {remove} from 'utils/storage';
import {StoredWallet} from '../../utils/stored-wallet';
import {AssetBalance, getBalance} from 'services/api';
import {Chains, WalletGenerator} from '@maze2/sezame-sdk';
import {WalletDescription} from '@maze2/sezame-sdk/dist/utils/types/WalletDescription';
import {NodeProvider} from '@alephium/web3';

const DerivedAddress = types.model({
  publicKey: types.string,
  privateKey: types.string,
  address: types.string,
  group: types.optional(types.string, ''), // For sharded chains like alephium
  index: types.optional(types.number, 0),
  balance: types.optional(types.number, 0),
  stakedBalance: types.optional(types.number, 0),
  freeBalance: types.optional(types.number, 0),
  unconfirmedBalance: types.optional(types.number, 0),
  unlockedBalance: types.optional(types.number, 0),
  unstakedBalance: types.optional(types.number, 0),
  value: types.optional(types.number, 0),
  rate: types.optional(types.number, 0),
  version: types.optional(types.number, 0),
  derivationIndex: types.optional(types.number, 0),
});

const WalletAsset = types.model({
  index: types.optional(types.number, 0),
  name: types.string,
  chain: types.string,
  publicKey: types.string,
  privateKey: types.string,
  address: types.string,
  group: types.optional(types.string, ''), // For sharded chains like alephium
  symbol: types.string,
  type: types.string,
  cid: types.optional(types.string, ''),
  contract: types.maybeNull(types.string),
  balance: types.optional(types.number, 0),
  balanceWithDerivedAddresses: types.optional(types.number, 0),
  stakedBalance: types.optional(types.number, 0),
  freeBalance: types.optional(types.number, 0),
  unconfirmedBalance: types.optional(types.number, 0),
  unlockedBalance: types.optional(types.number, 0),
  unstakedBalance: types.optional(types.number, 0),
  value: types.optional(types.number, 0),
  rate: types.optional(types.number, 0),
  version: types.optional(types.number, 0),
  image: types.optional(types.string, ''),
  decimals: types.optional(types.number, 8),
  derivedAddresses: types.optional(types.array(DerivedAddress), []),
  selectedAddress: types.optional(types.number, -1),
  nodeProvider: types.frozen(),
});

export type IWalletAsset = Instance<typeof WalletAsset>;
export type IWalletDerivedAddress = Instance<typeof DerivedAddress>;

export type BaseWalletDescription = {
  index: number;
  name: string;
  chain: string;
  cid: string;
  publicKey: string;
  privateKey: string;
  address: string;
  group: string;
  symbol: string;
  type: string;
  decimals: number;
  contract: string | null;
  balance: number;
  nodeProvider?: NodeProvider;
};

const sleep = async (time: number) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

/**
 * Model description here for TypeScript hints.
 */
export const CurrentWalletModel = types
  .model('CurrentWallet')
  .props({
    wallet: types.maybe(types.string),
    name: types.maybe(types.string),
    assets: types.array(WalletAsset),
    loadingBalance: types.boolean,
    updatingAssets: types.boolean,
    mnemonic: types.maybe(types.string),
  })
  .views(self => ({
    getWallet: () => {
      if (self.wallet) {
        return StoredWallet.loadFromJson(JSON.parse(self.wallet));
      }
      return null;
    },
    getAssets: async () => {
      return self.assets;
    },
    getAssetById: (cid: string, chain?: string) => {
      return self.assets.find(
        a =>
          (!chain && a.cid === cid) ||
          (chain && a.cid === cid && a.chain === chain),
      );
    },
    getAssetsById: (cid: string, chain?: string) => {
      return self.assets.filter(
        a =>
          (!chain && a.cid === cid) ||
          (chain && a.cid === cid && a.chain === chain),
      );
    },

    getSelectedAddressForAsset: (
      cid: string,
      chain?: string,
    ): BaseWalletDescription | null => {
      const asset = self.assets.find(
        a =>
          (!chain && a.cid === cid) ||
          (chain && a.cid === cid && a.chain === chain),
      );

      if (asset) {
        if (asset.selectedAddress === -1) {
          return asset;
        } else {
          if (asset.derivedAddresses[asset.selectedAddress]) {
            return {...asset, ...asset.derivedAddresses[asset.selectedAddress]};
          }
          return asset;
        }
      }

      return asset ?? null;
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions(self => ({
    setSelectedAddress: (alphWalletAddress: string, chain: string) => {
      const alph = self.assets.find(asset => asset.chain === chain);
      if (alph) {
        const index =
          alph.derivedAddresses.findIndex(
            d => d.address === alphWalletAddress,
          ) ?? -1;
        alph.selectedAddress = index;
      }
    },
    addAutoAsset: flow(function* (asset: any) {
      self.updatingAssets = true;
      const existingAsset: IWalletAsset = self.assets.find(currentAsset => {
        return asset.chain === currentAsset.chain;
      });

      yield sleep(100);

      const wallet: StoredWallet = yield StoredWallet.loadFromJson(
        JSON.parse(self.wallet),
      );

      try {
        if (
          existingAsset &&
          existingAsset.publicKey &&
          existingAsset.privateKey &&
          existingAsset.address
        ) {
          self.assets.push({
            ...asset,
            publicKey: existingAsset.publicKey,
            privateKey: existingAsset.privateKey,
            address: existingAsset.address,
          });
        } else {
          const newAsset: WalletDescription =
            yield WalletGenerator.generateKeyPairFromMnemonic(
              wallet.mnemonic,
              asset.chain as Chains,
              0,
            );
          self.assets.push({
            ...asset,
            publicKey: newAsset.publicKey,
            privateKey: newAsset.privateKey,
            address: newAsset.address,
            nodeProvider: newAsset.nodeProvider,
          });
        }

        wallet.assets = self.assets;
        self.wallet = JSON.stringify(wallet.toJson());
        yield wallet.save();
      } catch (ex) {
        console.error(ex);
      } finally {
        self.updatingAssets = false;
      }
    }),

    addDerivedAddress: flow(function* (
      concernedAsset: IWalletAsset,
      derivedAddress: IWalletDerivedAddress,
    ) {
      self.updatingAssets = true;

      try {
        if (self.wallet) {
          const wallet: StoredWallet = yield StoredWallet.loadFromJson(
            JSON.parse(self.wallet),
          );

          // Trouver l'index de l'actif concerné dans la liste des actifs
          const index = self.assets.indexOf(concernedAsset);

          if (index !== -1) {
            if (self.assets[index].address === derivedAddress.address) {
              // If address already in the wallet, don't add it...
              console.warn(
                `Address ${derivedAddress.address} already in the wallet...`,
              );
              return;
            }
            const derivationExist = self.assets[index].derivedAddresses.find(
              derivation => derivation.address === derivedAddress.address,
            );
            if (derivationExist) {
              console.warn(
                `Address ${derivedAddress.address} already in the wallet...`,
              );
              return;
            }

            self.assets[index].derivedAddresses.push(derivedAddress);
            wallet.assets = self.assets;
            self.wallet = JSON.stringify(wallet.toJson());
            yield wallet.save();
          }
        }
      } catch (e) {
        console.log(e);
      } finally {
        self.updatingAssets = false;
      }
    }),

    removeAsset: flow(function* (chainId: string, symbol: string) {
      if (!self.wallet) {
        return;
      }

      self.updatingAssets = true;
      yield sleep(50);

      try {
        self.assets.replace(
          self.assets.filter(asset => {
            return (
              asset.chain?.toLowerCase() !== chainId?.toLowerCase() ||
              asset.symbol?.toLowerCase() !== symbol?.toLowerCase()
            );
          }),
        );

        const wallet: StoredWallet = yield StoredWallet.loadFromJson(
          JSON.parse(self.wallet),
        );
        wallet.assets = self.assets;
        self.wallet = JSON.stringify(wallet.toJson());

        yield wallet.save();
      } catch (e) {
        console.log(e);
      } finally {
        self.updatingAssets = false;
      }
    }),

    hasAsset: (network: NetworkType): boolean => {
      return (
        self.assets.filter(asset => {
          return asset.name === network.name;
        }).length > 0
      );
    },

    resetBalance: () => {
      if (!self.wallet) {
        return;
      }

      const wallet = JSON.parse(self.wallet);

      for (let asset of self.assets) {
        asset = {
          ...asset,
          balance: 0,
          stakedBalance: 0,
          freeBalance: 0,
          unconfirmedBalance: 0,
          unlockedBalance: 0,
          unstakedBalance: 0,
        };
      }

      wallet.assets = self.assets;
      self.wallet = JSON.stringify(wallet);
    },

    open: (wallet: StoredWallet) => {
      self.wallet = JSON.stringify(wallet.toJson());
      self.mnemonic = wallet.mnemonic;
      self.assets.clear();
      const assets = wallet.toJson().assets;

      for (const asset of assets) {
        self.assets.push(asset);
      }
      // self.assets.replace(wallet.toJson().assets as any)
      self.name = wallet.toJson().walletName;

      // Define default wallet address
      const alph = self.assets.find(asset => asset.chain === 'ALPH');
      if (alph) {
        self.alphSelectedAddress = {
          address: alph.address,
          group: alph.group,
          index: alph.index,
          privateKey: alph.privateKey,
          publicKey: alph.publicKey,
          balance: alph.balance,
        };
      }
    },
    close: () => {
      self.wallet = undefined;
      self.assets.clear();
      self.name = '';
      self.mnemonic = undefined;
    },
    setBalance: (asset: BaseWalletDescription, assetBalance: AssetBalance) => {
      const storedAsset = self.assets.find(
        a => a.symbol === asset.symbol && a.chain === asset.chain,
      );

      if (!storedAsset) {
        return;
      }

      storedAsset.balance = assetBalance.confirmedBalance;
      storedAsset.stakedBalance = assetBalance.stakedBalance ?? 0;
      storedAsset.freeBalance = assetBalance.freeBalance ?? 0;
      storedAsset.unconfirmedBalance = assetBalance.unconfirmedBalance;
      storedAsset.unlockedBalance = assetBalance.unlockedBalance ?? 0;
      storedAsset.unstakedBalance = assetBalance.unstakedBalance ?? 0;
    },
    stopLoading: () => {
      self.loadingBalance = false;
    },
    refreshBalances: flow(function* refreshBalances() {
      self.loadingBalance = true;

      for (let asset of self.assets) {
        try {
          const balance = yield getBalance(asset);
          asset.balance = balance.confirmedBalance;
          asset.stakedBalance = balance.stakedBalance;
          asset.freeBalance = balance.freeBalance;
          asset.unconfirmedBalance = balance.unconfirmedBalance;
          asset.unlockedBalance = balance.unlockedBalance;
          asset.unstakedBalance = balance.unstakedBalance;
          asset.balanceWithDerivedAddresses = asset.balance;

          for (let i = 0; i < asset.derivedAddresses.length; i++) {
            const currentDerivedAddress = asset.derivedAddresses[i];

            const balance = yield getBalance({
              ...currentDerivedAddress,
              chain: asset.chain,
              cid: asset.cid,
            });
            currentDerivedAddress.balance = balance.confirmedBalance;
            currentDerivedAddress.stakedBalance = balance.stakedBalance;
            currentDerivedAddress.freeBalance = balance.freeBalance;
            currentDerivedAddress.unconfirmedBalance =
              balance.unconfirmedBalance;
            currentDerivedAddress.unlockedBalance = balance.unlockedBalance;
            currentDerivedAddress.unstakedBalance = balance.unstakedBalance;
            asset.balanceWithDerivedAddresses += currentDerivedAddress.balance;
          }
        } catch (error) {
          console.error({error});
        }
      }
      self.loadingBalance = false;
    }),

    removeWallet: async () => {
      let deleted = null;
      try {
        deleted = await remove(self.name);
      } catch (error) {
        console.log('Error removing wallet', error);
      }
      return deleted;
    },
  })); // eslint-disable-line @typescript-eslint/no-unused-vars

export const currentWalletStore = CurrentWalletModel.create({
  wallet: undefined, // the type here is different from the type in the actual model
  loadingBalance: false,
  updatingAssets: false,
});

type CurrentWalletType = Instance<typeof CurrentWalletModel>;
export interface CurrentWallet extends CurrentWalletType {}
type CurrentWalletSnapshotType = SnapshotOut<typeof CurrentWalletModel>;
export interface CurrentWalletSnapshot extends CurrentWalletSnapshotType {}
export const createCurrentWalletDefaultModel = () =>
  types.optional(CurrentWalletModel, {
    wallet: undefined,
    loadingBalance: false,
    updatingAssets: false,
  });
