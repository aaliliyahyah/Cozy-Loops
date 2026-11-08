import { Image, StyleSheet, View, useWindowDimensions } from 'react-native';
export function Gingham({ topFill = 0 }: { topFill?: number }) {
  const { width } = useWindowDimensions();
  return (    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[styles.ribbon, topFill > 0 && { height: topFill + 34 }]}>
      <View style={[styles.checks, { height: topFill + 18 }]}>
        <Image source={require('@/assets/images/sage-gingham-scalloped-light.png')} accessible={false} resizeMode="stretch" style={{ width: width + 80, height: Math.max((width + 80) / 3, (topFill + 18) * 4) }} />
      </View>
      <Image source={require('@/assets/images/olive-bow.png')} accessible={false} style={[styles.bow, topFill > 0 && { top: topFill }]} />
    </View>);
}
const styles = StyleSheet.create({
  ribbon: { height: 34, overflow: 'hidden', marginHorizontal: -20 },
  checks: { overflow: 'hidden', position: 'absolute', top: 8, left: -40, transform: [{ rotate: '-0.5deg' }] },
  bow: { position: 'absolute', width: 52, height: 30, resizeMode: 'contain', alignSelf: 'center', top: 0 },
});
