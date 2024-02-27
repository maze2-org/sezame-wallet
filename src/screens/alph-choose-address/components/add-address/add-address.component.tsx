import {Button, Text} from 'components';
import React, {useState} from 'react';
import {View} from 'react-native';
import {color} from 'theme';
import RNPickerSelect from 'react-native-picker-select';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

function AddAddress({
  onAddAddress,
  forceGroup,
}: {
  onAddAddress: (group?: 1 | 2 | 3 | 0) => any;
  forceGroup?: 1 | 2 | 3 | 0;
}) {
  const [selectedGroup, setSelectedGroup] = useState<
    1 | 2 | 3 | 0 | undefined
  >();

  const handleAddAddress = () => {
    onAddAddress(selectedGroup);
  };

  if (forceGroup !== undefined) {
    return (
      <View>
        <Button onPress={() => onAddAddress(forceGroup)}>
          <Text>Create group {forceGroup} address</Text>
        </Button>
      </View>
    );
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 72,
        borderWidth: 1,
        borderColor: color.palette.gold,
        borderRadius: 12,
        padding: 16,
        borderStyle: 'dashed',
        width: '100%',
      }}>
      <View
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          gap: 8,
        }}>
        <Text>Generate a new address</Text>
        <View style={{display: 'flex', flexDirection: 'row'}}>
          <View
            style={{
              flex: 1,
              flexGrow: 1,
            }}>
            <RNPickerSelect
              style={{
                inputIOSContainer: {
                  backgroundColor: 'black',
                  borderTopLeftRadius: 8,
                  borderBottomLeftRadius: 8,
                  borderWidth: 1,
                  borderColor: color.palette.gold,
                  padding: 16,
                  flexDirection: 'row', // Pour aligner l'icône et le texte horizontalement
                  alignItems: 'center', // Pour centrer verticalement l'icône
                },
                inputIOS: {
                  color: color.palette.gold,
                },
              }}
              onValueChange={value =>
                setSelectedGroup(
                  value ? (parseInt(value) as 0 | 1 | 2 | 3) : undefined,
                )
              }
              Icon={() => (
                <FontAwesomeIcon
                  name={'chevron-down'}
                  color={color.palette.gold}
                  style={{paddingRight: 8}}
                />
              )}
              items={[
                {label: 'Auto', value: undefined},
                {label: 'Group 0', value: 0},
                {label: 'Group 1', value: 1},
                {label: 'Group 2', value: 2},
                {label: 'Group 3', value: 3},
              ]}
            />
          </View>
          <View>
            <Button
              onPress={handleAddAddress}
              style={{
                flex: 1,
                borderBottomLeftRadius: 0,
                borderTopLeftRadius: 0,
              }}>
              <Text>Create</Text>
            </Button>
          </View>
        </View>
      </View>
    </View>
  );
}

export default AddAddress;
