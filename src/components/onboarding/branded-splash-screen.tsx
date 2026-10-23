import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Animated, Easing, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type BrandedSplashScreenProps = { onFinish: () => void; hold?: boolean };

export function BrandedSplashScreen({ onFinish, hold = false }: BrandedSplashScreenProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scale = Math.min(width / 393, 1.35);
  const [imageReady, setImageReady] = useState(false);
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const animation = Animated.loop(Animated.timing(progress, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true, isInteraction: false }));
    animation.start();
    return () => animation.stop();
  }, [progress]);

  useEffect(() => {
    if (!imageReady || hold) return;
    const timeout = setTimeout(onFinish, 1800);
    return () => clearTimeout(timeout);
  }, [hold, imageReady, onFinish]);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <Image
        source={require("@/assets/images/splash-warehouse.jpg")}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        onLoadEnd={() => setImageReady(true)}
      />
      <View pointerEvents="none" style={styles.tint} />
      <View style={[styles.brand, { top: height * 0.3055 }]} accessible accessibilityLabel="OgaDesk. Your Business. In Control.">
        <Image source={require("@/assets/images/brand-splash.svg")} style={{ width: 124 * scale, height: 146 * scale }} contentFit="fill" />
        <Text style={[styles.wordmark, { fontSize: 58 * scale, lineHeight: 72 * scale }]}>Oga<Text style={styles.accent}>Desk</Text></Text>
        <Text style={[styles.tagline, { fontSize: 22.5 * scale, lineHeight: 30 * scale, marginTop: 3 * scale }]}>Your Business. In Control.</Text>
      </View>
      <View style={[styles.footer, { bottom: insets.bottom + 22 * scale }]}>
        <View accessibilityRole="progressbar" accessibilityLabel="Loading OgaDesk" style={[styles.track, { width: 64 * scale, height: 6 * scale }]}>
          <Animated.View style={[styles.progress, { width: 28 * scale, transform: [{ translateX: hold ? 0 : progress.interpolate({ inputRange: [0, 1], outputRange: [-14 * scale, 64 * scale] }) }] }]} />
        </View>
        <Text style={[styles.footerText, { fontSize: 18 * scale, lineHeight: 24 * scale, marginTop: 24 * scale }]}>Managing stock. Powering growth.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#003B3F" },
  tint: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: "rgba(0, 38, 43, 0.2)" },
  brand: { position: "absolute", left: 0, right: 0, alignItems: "center" },
  wordmark: { color: "#FFFFFF", fontWeight: "800", letterSpacing: -2.4 },
  accent: { color: "#00A79B" },
  tagline: { color: "#FFFFFF", letterSpacing: 0.3 },
  footer: { position: "absolute", left: 12, right: 12, alignItems: "center" },
  track: { backgroundColor: "rgba(255, 255, 255, 0.36)", borderRadius: 4, overflow: "hidden" },
  progress: { height: "100%", backgroundColor: "#FFFFFF", borderRadius: 4 },
  footerText: { color: "#FFFFFF", textAlign: "center" },
});
