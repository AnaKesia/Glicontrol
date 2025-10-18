import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
    position: 'relative',
  },
  input: {
    color: '#000',
    backgroundColor: '#fff',
    height: 45,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  tooltip: {
    position: 'absolute',
    top: -40,
    left: 10,
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 6,
    zIndex: 1,
  },
  tooltipText: {
    color: '#007AFF',
    fontSize: 12,
  },
  tooltipArrow: {
    position: 'absolute',
    bottom: -6,
    left: 10,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#fff',
  },
  registroContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registro: {
    color: '#fff',
  },
  registrarLink: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    color: '#fff',
  },
});