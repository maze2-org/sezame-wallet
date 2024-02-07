import React from 'react';
import {Footer} from 'components';
import {BaseWalletDescription} from 'models';
import IonIcons from 'react-native-vector-icons/Ionicons';
import {Linking} from 'react-native';

type CoinDetailsProps = {
  asset: BaseWalletDescription;
  explorerUrl: string;
  onClickBack: () => any;
};

const CoinDetailsFooter = ({
  asset,
  explorerUrl,
  onClickBack,
}: CoinDetailsProps) => {
  const openLink = async (url: string) => {
    Linking.openURL(url);
  };

  return (
    <Footer
      showRightButton={!!asset}
      rightButtonText="Explore"
      RightButtonIcon={(props: any) => (
        <IonIcons {...props} name="globe-outline" size={23} />
      )}
      onRightButtonPress={() => explorerUrl && openLink(explorerUrl)}
      rightButtonDisabled={!explorerUrl}
      onLeftButtonPress={() => onClickBack && onClickBack()}
    />
  );
};

export default CoinDetailsFooter;
