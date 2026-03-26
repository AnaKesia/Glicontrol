import { Platform } from 'react-native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

export const TimePicker = ({ dataHora, onConfirm }) => {
  if (Platform.OS === 'android') {
    const dataAtual = dataHora ?? new Date();

    DateTimePickerAndroid.open({
      value: dataAtual,
      mode: 'date',
      is24Hour: true,
      onChange: (event, selectedDate) => {
        if (event.type !== 'set' || !selectedDate) return;

        DateTimePickerAndroid.open({
          value: selectedDate,
          mode: 'time',
          is24Hour: true,
          onChange: (event2, selectedTime) => {
            if (event2.type !== 'set' || !selectedTime) return;

            const final = new Date(selectedDate);
            final.setHours(selectedTime.getHours());
            final.setMinutes(selectedTime.getMinutes());

            onConfirm && onConfirm(final);
          },
        });
      },
    });
  }
};