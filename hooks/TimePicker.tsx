import React from 'react';
import { View, Button, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export const TimePicker = ({ dataHora, setDataHora, mostrar, setMostrar }) => {
  if (!mostrar) return null;

  return (
    <DateTimePicker
      value={dataHora}
      mode="time"
      is24Hour
      display="default"
      onChange={(event, date) => {
        if (event.type === 'dismissed') {
          setMostrar(false);
          return;
        }
        if (event.type === 'set' && date) setDataHora(date);
        if (Platform.OS === 'android') setMostrar(false);
      }}
    />
  );
};
