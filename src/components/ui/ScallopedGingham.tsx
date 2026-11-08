import { Image, View } from 'react-native';

// Clip the transparent space below the supplied curtain border.
export function ScallopedGingham({ topFill = 0 }: { topFill?: number }) {
  const height = topFill + 34;
  return <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ height, marginHorizontal: -20, overflow: 'hidden' }}>
    <Image source={require('@/assets/images/sage-gingham-scalloped-light.png')} accessible={false} resizeMode="stretch" style={{ width: '165%', alignSelf: 'center', height: height * 724 / 270 }} />
  </View>;
}
