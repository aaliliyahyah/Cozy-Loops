import { Alert, Platform } from 'react-native';

export function confirm(title: string, message: string, action: () => void, destructive = false) {
  if (Platform.OS === 'web') { if (window.confirm(`${title}\n${message}`)) action(); return; }
  Alert.alert(title, message, [{ text: 'Cancel', style: 'cancel' }, { text: 'Confirm', style: destructive ? 'destructive' : 'default', onPress: action }]);
}
