import React, {FC, useRef, useEffect, useState, useCallback} from 'react';
import {observer} from 'mobx-react-lite';
import {
  ImageBackground,
  TextStyle,
  View,
  ViewStyle,
  ScrollView,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
} from 'react-native';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import {NavigatorParamList} from 'navigators';
import BigNumber from 'bignumber.js';

import {
  Text,
  Button,
  Drawer,
  Footer,
  Screen,
  WalletButton,
  CurrencyDescriptionBlock,
} from 'components';

import {color, spacing} from 'theme';
import {Controller, useForm, useWatch} from 'react-hook-form';
import {TextInputField} from 'components/text-input-field/text-input-field';
import {
  textInput,
  CONTAINER,
  MainBackground,
  BackgroundStyle,
  drawerErrorMessage,
} from 'theme/elements';
import {useNavigation} from '@react-navigation/native';
import {BaseWalletDescription, useStores} from 'models';
import {getBalance, getFees} from 'services/api';
import styles from './styles';
import {presets} from 'components/screen/screen.presets';
import {CONFIG, Chains, NodeProviderGenerator} from '@maze2/sezame-sdk';

import {
  transferLocalTokenFromAlph,
  CHAIN_ID_ETH,
  MAINNET_ALPH_MINIMAL_CONSISTENCY_LEVEL,
} from '@alephium/wormhole-sdk';

import * as alephiumMainnetConfig from '../../bridges/alephium/artifacts/.deployments.mainnet.json';
import {PrivateKeyWallet} from '@alephium/web3-wallet';
import {ALPH_TOKEN_ID, NodeProvider, ONE_ALPH} from '@alephium/web3';
import {BridgeSettings} from '@maze2/sezame-sdk/dist/utils/config';
import {showMessage} from 'react-native-flash-message';

const ROOT: ViewStyle = {
  backgroundColor: color.palette.black,
  flex: 1,
};

type BridgeDetails = {
  nodeProvider?: NodeProvider | null;
  signer?: PrivateKeyWallet | null;
  bridgeConfig?: BridgeSettings | null;
};

export const BridgeScreen: FC<StackScreenProps<NavigatorParamList, 'bridge'>> =
  observer(function BridgeScreen({route}) {
    // styling
    const DashboardStyle: ViewStyle = {
      ...ROOT,
    };

    const WALLET_STYLE: ViewStyle = {
      width: '100%',
      alignItems: 'center',
      display: 'flex',
      flexDirection: 'column',
    };

    const ALIGN_CENTER: ViewStyle = {
      alignItems: 'center',
    };

    const DrawerStyle: ViewStyle = {
      display: 'flex',
    };
    const SCROLL_VIEW_CONTAINER: ViewStyle = {
      flexGrow: 1,
      justifyContent: 'space-between',
      backgroundColor: color.palette.black,
    };

    // Pull in one of our MST stores
    const {currentWalletStore, pendingTransactions, exchangeRates} =
      useStores();
    const {getSelectedAddressForAsset, assets} = currentWalletStore;
    const {
      control,
      handleSubmit,
      formState: {errors, isValid},
    } = useForm({mode: 'onChange'});

    const textInputAmount = useWatch({
      control,
      name: 'amount',
      defaultValue: '',
    });

    const [bridgeDetails, setBridgeDetails] = useState<BridgeDetails>({
      nodeProvider: null,
      signer: null,
      bridgeConfig: null,
    });

    const transferToBridge = async (amount: number) => {
      if (!asset || !amount) {
        return;
      }

      const nodeProvider = await NodeProviderGenerator.getNodeProvider(
        asset.chain as Chains,
      );

      const wallet = new PrivateKeyWallet({
        privateKey: asset.privateKey,
        nodeProvider,
      });

      const bridgeConfig: BridgeSettings | null =
        (CONFIG.getConfigFor(asset.chain, 'bridge') as BridgeSettings) || null;

      if (!bridgeConfig) {
        return false;
      }
      const bAmount = BigInt(Number(amount) * 1000000000000000000);

      try {
        console.log('MESSAGEFEEEEEEEEEEEEEEEE', bridgeConfig.config.messageFee);
        const result = await transferLocalTokenFromAlph(
          wallet,
          alephiumMainnetConfig.contracts.TokenBridge.contractInstance
            .contractId,
          wallet.account.address,
          ALPH_TOKEN_ID,
          CHAIN_ID_ETH,
          bridgeConfig.config.contracts.nativeTokenBridge,
          bAmount,
          BigInt(bridgeConfig.config.messageFee),
          0n,
          MAINNET_ALPH_MINIMAL_CONSISTENCY_LEVEL,
        );

        console.log('result', {result});
      } catch (err) {
        console.log('THERE WAS AN ERROR IN transferLocalTokenFromAlph', err);
      } finally {
        console.log('Done...');
      }

      console.log('TRANSFER DONEEEEEEEEEEEEE');

      // console.log({result});
    };

    // Pull in navigation via hook
    const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>();
    const asset = getSelectedAddressForAsset(
      route.params.coinId,
      route.params.chain,
    );
    const [fees, setFees] = useState<any>(null);
    const [isPreview, setIsPreview] = useState<boolean>(false);
    const [sending, setSending] = useState<boolean>(false);
    const [sendable, setSendable] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [amount, setAmount] = useState<number | null>(0);
    const numericRegEx = useRef(/^\d+(.\d+)?$/).current;
    const {setBalance} = currentWalletStore;

    useEffect(() => {
      const _getBalances = async () => {
        if (asset) {
          const balance = await getBalance(asset);
          setBalance(asset, balance);
        }
      };
      _getBalances();
    }, []);

    useEffect(() => {
      // Convert the string got from the form into a number (Sdk needs a number and not a string)
      setAmount(parseFloat(textInputAmount.split(',').join('.')));
    }, [textInputAmount]);

    const init = useCallback(async (asset: BaseWalletDescription) => {
      const nodeProvider = await NodeProviderGenerator.getNodeProvider(
        asset.chain as Chains,
      );

      const signer = new PrivateKeyWallet({
        privateKey: asset.privateKey,
        nodeProvider,
      });

      const bridgeConfig =
        (CONFIG?.getConfigFor &&
          (CONFIG.getConfigFor(
            asset.chain as Chains,
            'bridge',
          ) as BridgeSettings)) ||
        null;

      console.log('Define provider');
      setBridgeDetails({nodeProvider, signer, bridgeConfig});
    }, []);

    useEffect(() => {
      if (asset) {
        init(asset);
      }
    }, [asset?.address, asset?.chain, init]);

    const truncateRecipient = (hash: string) => {
      return (
        hash.substring(0, 8) +
        '...' +
        hash.substring(hash.length - 8, hash.length)
      );
    };

    const onSubmit = async () => {
      setErrorMsg(null);
      try {
        if (!asset || amount === null) {
          return;
        }

        const {bridgeConfig} = bridgeDetails;

        if (!bridgeConfig) {
          return;
        }

        setIsPreview(true);
        setSendable(false);
        const response = await getFees(
          asset,
          bridgeConfig.config.contracts.nativeTokenBridge,
          amount,
          'bridge',
        );
        console.log(response);
        setFees(response);
        console.log('SUBMITTING ---------------------->', {asset, amount});
        // transferToBridge(amount);
        setSendable(true);
      } catch (error: any) {
        console.log('THERE IS AN ERROR IN THE TRANSFER');
        console.log(error);
        switch (error.message) {
          case 'INSUFFICIENT_FUNDS':
            setErrorMsg('Insufficiant funds');
            break;
          default:
            setErrorMsg(error.message);
            break;
        }

        setSendable(false);
      }
    };

    const processTransaction = async () => {
      if (!asset) {
        return;
      }

      if (!amount) {
        return;
      }

      setSending(true);
      try {
        transferToBridge(amount);
        // const txId = await makeSendTransaction(
        //   asset,
        //   fees ? fees.regular : null,
        // );
        // if (!txId) {
        //   showMessage({message: 'Unable to Send', type: 'danger'});
        // } else {
        //   if (amount === null) {
        //     showMessage({message: 'No amount specified', type: 'danger'});
        //     return;
        //   }
        //   showMessage({message: 'Transaction sent', type: 'success'});
        //   pendingTransactions.add(asset, {
        //     amount: `-${new BigNumber(amount)
        //       .plus(
        //         fees.regular.settings.feeValue
        //           ? fees.regular.settings.feeValue
        //           : '0',
        //       )
        //       .toString()}`,
        //     from: asset.address,
        //     to: recipientAddress,
        //     timestamp: new Date().getTime(),
        //     reason: 'transaction',
        //     txId,
        //   });
        setFees(null);
        setIsPreview(false);
        goBack();
        // }
      } catch (err: any) {
        showMessage({message: err.message, type: 'danger'});
      } finally {
        setSending(false);
      }
    };

    // const validAddress = address => {
    //   return checkAddress(address, asset.chain as any) || 'Invalid address';
    // };

    const goBack = () => navigation.goBack();

    return (
      <Screen
        unsafe
        style={DashboardStyle}
        preset="fixed"
        backgroundColor={color.palette.black}>
        <ScrollView
          contentContainerStyle={SCROLL_VIEW_CONTAINER}
          keyboardShouldPersistTaps={'handled'}>
          <KeyboardAvoidingView
            style={[
              presets.scroll.outer,
              {backgroundColor: color.palette.black},
            ]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={50}>
            <ImageBackground source={MainBackground} style={BackgroundStyle}>
              <View style={CONTAINER}>
                <View style={WALLET_STYLE}>
                  <CurrencyDescriptionBlock
                    icon="transfer"
                    balance="freeBalance"
                    asset={asset}
                    title="Available balance"
                  />
                </View>
                <View>
                  <Controller
                    control={control}
                    name="amount"
                    render={({field: {onChange, value, onBlur}}) => (
                      <TextInputField
                        name="amount"
                        style={textInput}
                        errors={errors}
                        label="Amount to bridge"
                        fieldStyle="alt"
                        value={value}
                        onBlur={onBlur}
                        onChangeText={value => onChange(value)}
                        keyboardType="numeric"
                        numberOfLines={1}
                        returnKeyType="done"
                      />
                    )}
                    rules={{
                      required: {
                        value: true,
                        message: 'Field is required!',
                      },
                      pattern: {
                        value: numericRegEx,
                        message: 'Invalid amount',
                      },
                      max: {
                        value: asset.freeBalance,
                        message: 'Insufficient funds',
                      },
                    }}
                  />
                </View>
                <View style={ALIGN_CENTER}>
                  <WalletButton
                    type="primary"
                    text="Preview the operation"
                    outline={true}
                    disabled={!isValid}
                    onPress={() => {
                      Keyboard.dismiss();
                      handleSubmit(onSubmit)();
                    }}
                  />
                </View>
              </View>
            </ImageBackground>
            {isPreview && (
              <Drawer
                title="Sign and Submit"
                style={DrawerStyle}
                actions={[
                  <Button
                    text="CANCEL"
                    style={styles.DRAWER_BTN_CANCEL}
                    textStyle={styles.DRAWER_BTN_TEXT}
                    disabled={sending}
                    onPress={() => {
                      setIsPreview(false);
                    }}
                  />,
                  <Button
                    text={sending ? 'SENDING...' : 'SIGN AND SUBMIT'}
                    disabled={sending || !sendable}
                    style={styles.DRAWER_BTN_OK}
                    textStyle={styles.DRAWER_BTN_TEXT}
                    onPress={processTransaction}
                  />,
                ]}>
                <View style={styles.DRAWER_CARD}>
                  <View style={styles.DRAWER_CARD_ITEM}>
                    <Text style={styles.CARD_ITEM_TITLE}>Transfer</Text>
                    <View style={styles.CARD_ITEM_DESCRIPTION}>
                      <Text style={styles.AMOUNT_STYLE}>
                        {amount} {asset?.symbol.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.CARD_ITEM_DIVIDER} />
                  <View style={styles.DRAWER_CARD_ITEM}>
                    <Text style={styles.CARD_ITEM_TITLE}>Recipient</Text>
                    <View style={styles.CARD_ITEM_DESCRIPTION}>
                      <Text style={styles.AMOUNT_STYLE}>
                        {truncateRecipient(
                          `${bridgeDetails.bridgeConfig?.config.contracts.nativeTokenBridge}`,
                        )}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.CARD_ITEM_DIVIDER} />
                  <View style={styles.DRAWER_CARD_ITEM}>
                    <Text style={styles.CARD_ITEM_TITLE}>Transaction fees</Text>
                    <View style={styles.CARD_ITEM_DESCRIPTION}>
                      <Text style={styles.AMOUNT_STYLE}>
                        {fees && (
                          <>
                            {fees
                              ? `${fees.regular.settings.feeValue.toFixed(6)} ${
                                  fees.regular.currency
                                }`
                              : ''}{' '}
                            <Text style={styles.EQUIVALENT_USD_STYLE}>
                              (~
                              {`${(
                                exchangeRates.getRate(asset.cid) *
                                fees.regular.settings.feeValue
                              ).toFixed(2)}`}
                              $)
                            </Text>
                          </>
                        )}
                      </Text>
                    </View>
                  </View>
                </View>
                {errorMsg && (
                  <Text style={[drawerErrorMessage]}>{errorMsg}</Text>
                )}
              </Drawer>
            )}

            <Footer onLeftButtonPress={goBack} />
          </KeyboardAvoidingView>
        </ScrollView>
      </Screen>
    );
  });
