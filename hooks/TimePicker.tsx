import { Platform } from 'react-native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

export const TimePicker = ({ dataHora, onConfirm }) => {
  if (Platform.OS === 'android') {
    DateTimePickerAndroid.open({
      value: dataHora ?? new Date(),
      mode: 'time',
      is24Hour: true,
      onChange: (event, date) => {
        if (event.type === 'set' && date) {
          onConfirm(new Date(date));
        }
      },
    });
  }
};
