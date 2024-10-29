import {Chains, WalletGenerator} from '@maze2/sezame-sdk';
import {IWalletAsset} from 'models/current-wallet/current-wallet';
import {decrypt, encrypt} from './encryption';
import {loadEncryptedWallet, loadString, remove, saveWallet} from './storage';
import {getAddressGroup} from 'services/api';

export interface WalletJson {
  walletName: string;
  mnemonic: string;
  password: string;
  assets: Array<IWalletAsset>;
}

export class StoredWallet {
  mnemonic: string;
  password: string;
  walletName: string;
  assets: Array<IWalletAsset> = [];
  creationDate: Date;

  constructor(
    walletName: string,
    mnemonic: string,
    password: string,
    assets?: Array<IWalletAsset>,
  ) {
    this.walletName = walletName;
    this.mnemonic = mnemonic;
    this.creationDate = new Date();
    this.password = password;
    this.assets = assets ? assets : [];
  }

  static async initializeAlephiumAddressesGroups(
    walletData: WalletJson,
  ): Promise<WalletJson> {
    const {assets} = walletData;

    for (const asset of assets) {
      if (asset.chain === 'ALPH' && !asset.group) {
        try {
          const group = await getAddressGroup(asset, asset.address);
          asset.group = group.toString();
        } catch (error: any) {
          console.error(
            `Erreur lors de la récupération du groupe pour ${asset.address}: ${error?.message}`,
          );
        }

        if (asset.derivedAddresses) {
          for (const derivedAddress of asset.derivedAddresses) {
            if (!derivedAddress.group) {
              try {
                const group = await getAddressGroup(
                  asset,
                  derivedAddress.address,
                );
                derivedAddress.group = group.toString();
              } catch (error: any) {
                console.error(
                  `Erreur lors de la récupération du groupe pour ${derivedAddress.address}: ${error?.message}`,
                );
              }
            }
          }
        }
        
      }
    }
    return walletData;
  }

  static async loadFromStorage(walletName: string, password: string) {
    try {
      const encryptedData = await loadEncryptedWallet(`${walletName}`);
      if (!encryptedData) {
        throw new Error("Wallet data don't exist");
      }
      let walletData: WalletJson = JSON.parse(decrypt(password, encryptedData));
      walletData = await this.initializeAlephiumAddressesGroups(walletData);
      const storedWallet = new StoredWallet(
        walletData.walletName,
        walletData.mnemonic,
        password,
        walletData.assets,
      );
      
      // await storedWallet.addAssets(walletData.assets)
      return storedWallet;
    } catch (err) {
      console.log(err);
      throw new Error('Unable to open this wallet');
    }
  }

  static async loadFromJson(json: WalletJson) {
    const wallet = new StoredWallet(
      json.walletName,
      json.mnemonic,
      json.password,
      json.assets,
    );
    return wallet;
  }

  toJson(): WalletJson {
    return {
      walletName: this.walletName,
      mnemonic: this.mnemonic,
      assets: this.assets,
      password: this.password,
    };
  }

  async save() {
    return await saveWallet(
      `${this.walletName}`,
      encrypt(this.password, JSON.stringify(this.toJson())),
    );
  }

  async remove() {
    await remove(this.walletName);
  }
  addAsset(asset: IWalletAsset) {
    this.assets.push(asset);
  }
  getExistingAssetForChain(chain: string): IWalletAsset {
    return this.assets.find(asset => {
      return asset.chain === chain;
    });
  }

  addAutoAsset(asset: IWalletAsset) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const existingAsset: IWalletAsset = this.getExistingAssetForChain(
          asset.chain,
        );

        if (
          existingAsset &&
          existingAsset.publicKey &&
          existingAsset.privateKey &&
          existingAsset.address
        ) {
          this.addAsset({
            ...asset,
            publicKey: existingAsset.publicKey,
            privateKey: existingAsset.privateKey,
            address: existingAsset.address,
          });
          resolve(true);
        } else {
          WalletGenerator.generateKeyPairFromMnemonic(
            this.mnemonic,
            asset.chain as Chains,
            0,
          )
            .then(wallet => {
              const newAsset = {
                ...asset,
                publicKey: wallet.publicKey,
                privateKey: wallet.privateKey,
                address: wallet.address,
              };

              this.addAsset(newAsset);
              resolve(true);
            })
            .catch(err => {
              reject(err);
            });
        }
      }, 1);
    });
  }

  public async addAssets(assets) {
    await Promise.all(assets.map(async asset => this.addAutoAsset(asset)));
  }

  public async changePassword(oldPassword: string, newPassword: string) {
    try {
      const encryptedData = await loadEncryptedWallet(`${this.walletName}`);
      JSON.parse(decrypt(oldPassword, encryptedData));
      this.password = newPassword;
      this.save();
    } catch (error) {
      throw new Error('Unable to change password');
    }
  }
}
