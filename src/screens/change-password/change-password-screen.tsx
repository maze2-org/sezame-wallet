import React, {FC, useEffect, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {ImageBackground, ScrollView, ViewStyle} from 'react-native';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import {NavigatorParamList} from '../../navigators';
import {Button, Footer, Screen, Text} from '../../components';
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import {color} from '../../theme';
import {Controller, useForm, useWatch} from 'react-hook-form';
import {ForwardedTextInputField} from 'components/text-input-field/text-input-field';
import {
  BackgroundStyle,
  CONTAINER,
  MainBackground,
  PRIMARY_BTN,
  PRIMARY_TEXT,
  RootPageStyle,
  textInput,
} from 'theme/elements';
import {useStores} from 'models/root-store/root-store-context';
import {showMessage} from 'react-native-flash-message';
import {useNavigation} from '@react-navigation/native';

export const ChangePasswordScreen: FC<
  StackScreenProps<NavigatorParamList, 'changePassword'>
> = observer(function ChangePasswordScreen() {
  // Pull in one of our MST stores
  // const { someStore, anotherStore } = useStores()
  const {currentWalletStore} = useStores();

  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Pull in navigation via hook
  // const navigation = useNavigation()
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>();

  const {
    control,
    handleSubmit,
    register,

    formState: {errors, isValid},
  } = useForm({mode: 'onChange'});

  const newPassword = useWatch({
    control,
    name: 'newPassword',
    defaultValue: '',
  });
  const goBack = () => navigation.goBack();
  const onSubmit = async data => {
    try {
      setIsLoading(true);
      const wallet = await currentWalletStore.getWallet();
      await wallet.changePassword(data.oldPassword, data.newPassword);
      showMessage({message: 'Password changed successfully', type: 'success'});
      navigation.goBack();
    } catch (error) {
      showMessage({message: "Couldn't change password", type: 'danger'});
    } finally {
      !!isMounted && setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  return (
    <Screen
      unsafe
      style={RootPageStyle}
      preset="scroll"
      backgroundColor={color.palette.black}>
      <ImageBackground source={MainBackground} style={BackgroundStyle}>
        <ScrollView contentContainerStyle={CONTAINER}>
          <Text preset="header" text="Change Password" />
          <Controller
            control={control}
            defaultValue={''}
            name="oldPassword"
            render={({field: {onChange, value, onBlur}}) => (
              <ForwardedTextInputField
                label="Old Password"
                secureTextEntry={true}
                name="oldPassword"
                style={textInput}
                errors={errors}
                value={value}
                onBlur={onBlur}
                onChangeText={value => onChange(value)}
                {...register('oldPassword', {
                  required: 'Please enter your old password',
                  minLength: {
                    value: 8,
                    message: 'Password must have at least 8 characters',
                  },
                })}
              />
            )}
          />
          <Controller
            control={control}
            defaultValue={''}
            name="newPassword"
            render={({field: {onChange, value, onBlur}}) => (
              <ForwardedTextInputField
                label="New password"
                secureTextEntry={true}
                name="newPassword"
                style={textInput}
                errors={errors}
                value={value}
                onBlur={onBlur}
                onChangeText={value => onChange(value)}
                {...register('newPassword', {
                  required: 'You must specify a password',
                  minLength: {
                    value: 8,
                    message: 'Password must have at least 8 characters',
                  },
                })}
              />
            )}
          />
          <Controller
            control={control}
            defaultValue={''}
            name="confirmPassword"
            render={({field: {onChange, value, onBlur}}) => (
              <ForwardedTextInputField
                label="Confirm password"
                secureTextEntry={true}
                name="confirmPassword"
                style={textInput}
                errors={errors}
                value={value}
                onBlur={onBlur}
                onChangeText={value => onChange(value)}
                {...register('confirmPassword', {
                  validate: value =>
                    value === newPassword || 'The passwords do not match',
                })}
              />
            )}
            rules={{
              required: {
                value: true,
                message: 'Field is required!',
              },
            }}
          />
          <Button
            testID="next-screen-button"
            style={PRIMARY_BTN}
            textStyle={PRIMARY_TEXT}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading || !isValid}>
            <Text text={isLoading ? 'Loading...' : 'Save'} />
          </Button>
        </ScrollView>
      </ImageBackground>
      <Footer onLeftButtonPress={goBack}></Footer>
    </Screen>
  );
});
