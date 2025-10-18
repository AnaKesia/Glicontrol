import firestore from '@react-native-firebase/firestore';

export const salvarSintoma = async (registro, id) => {
  if (id) {
    await firestore().collection('sintomas').doc(id).set(registro, { merge: true });
  } else {
    await firestore().collection('sintomas').add(registro);
  }
};
