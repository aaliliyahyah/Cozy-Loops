import { View, StyleSheet } from 'react-native';

export function Gingham() { return <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.gingham}>{Array.from({ length: 32 }, (_, i) => <View key={i} style={{ width: 22, height: 24, backgroundColor: i % 2 ? '#B7B77E55' : '#F1E8C6', borderBottomWidth: 12, borderBottomColor: i % 2 ? '#B7B77E33' : '#D7CFA155' }} />)}</View>; }

const styles = StyleSheet.create({
  gingham: { height: 24, flexDirection: 'row', overflow: 'hidden', borderRadius: 6, opacity: 0.8 },
});
