import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import {
  FlatList,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { BrandLogo } from "@/components/ui/brand-logo";
import { colors } from "@/constants/theme";

import { FeatureCard } from "./feature-card";

const slides = [
  {
    title: "Inventory.\nOperations.\nPeople.",
    subtitle: "All your business operations\nin one place.",
    image: require("@/assets/images/onboarding-hero-clean.jpg"),
  },
  {
    title: "Know your stock.\nAt a glance.",
    subtitle: "Scan products and keep every\nitem accounted for.",
    image: require("@/assets/images/onboarding-scan.png"),
  },
  {
    title: "Keep business\nmoving.",
    subtitle:
      "Track deliveries and stock movements,\nfrom warehouse to customer.",
    image: require("@/assets/images/onboarding-deliveries.png"),
  },
  {
    title: "Your team.\nIn control.",
    subtitle: "Give your people the right tools\nand access to get work done.",
    image: require("@/assets/images/onboarding-team.png"),
  },
] as const;

type Slide = (typeof slides)[number];
type OnboardingScreenProps = { onGetStarted: () => void; onSignIn: () => void };

export function OnboardingScreen({
  onGetStarted,
  onSignIn,
}: OnboardingScreenProps) {
  const { width, height, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const pageWidth = Math.min(width - insets.left - insets.right, 452);
  const scale = pageWidth / 393;
  const [page, setPage] = useState(0);
  const [carouselHeight, setCarouselHeight] = useState(0);
  const carousel = useRef<FlatList<Slide>>(null);

  // Every page reserves the same copy and artwork space. Lazy rendering a
  // longer subtitle must never resize the carousel or move the footer.
  const headingHeight = 3 * 46 * scale * fontScale;
  const subtitleHeight = 3 * 29 * scale * fontScale;
  const copyHeight = 26 * scale + headingHeight + 10 * scale + subtitleHeight;
  const heroHeight = Math.max(
    180 * scale,
    Math.min(350 * scale, carouselHeight - copyHeight),
  );
  // All four illustrations share this canvas and use contain, without stretching.
  const artworkWidth = Math.min(pageWidth, heroHeight * (1024 / 913));
  const artworkHeight = artworkWidth * (913 / 1024);
  const artworkScale = artworkWidth / 393;

  function updatePage(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const next = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
    setPage(Math.max(0, Math.min(slides.length - 1, next)));
  }

  function measureCarousel(event: LayoutChangeEvent) {
    setCarouselHeight(event.nativeEvent.layout.height);
  }

  function selectPage(index: number) {
    setPage(index);
    carousel.current?.scrollToIndex({ index, animated: true });
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <View
        style={[
          styles.content,
          {
            width: pageWidth,
            paddingTop: 12 * scale,
            paddingBottom: insets.bottom > 0 ? 0 : 16,
          },
        ]}
      >
        <View style={[styles.header, { paddingHorizontal: 24 * scale }]}>
          <BrandLogo scale={0.86 * scale} />
          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={onSignIn}
            style={({ pressed }) => [
              styles.skipButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.skip, { fontSize: 17 * scale }]}>Skip</Text>
          </Pressable>
        </View>

        <View style={styles.carousel} onLayout={measureCarousel}>
          {carouselHeight > 0 && (
            <FlatList
              // A new viewport width needs fresh native paging offsets after rotation.
              key={`${pageWidth}:${height}`}
              ref={carousel}
              data={slides}
              horizontal
              pagingEnabled
              style={styles.carousel}
              showsHorizontalScrollIndicator={false}
              onScroll={updatePage}
              scrollEventThrottle={32}
              onMomentumScrollEnd={updatePage}
              keyExtractor={(slide) => slide.title}
              initialNumToRender={slides.length}
              initialScrollIndex={page}
              windowSize={3}
              getItemLayout={(_, index) => ({
                length: pageWidth,
                offset: pageWidth * index,
                index,
              })}
              renderItem={({ item, index }) => (
                <View
                  testID={`onboarding-slide-${index + 1}`}
                  style={{
                    width: pageWidth,
                    height: carouselHeight,
                    overflow: "hidden",
                  }}
                  accessibilityElementsHidden={page !== index}
                  importantForAccessibility={
                    page === index ? "auto" : "no-hide-descendants"
                  }
                >
                  <ScrollView
                    bounces={false}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.pageContent}
                    // Small screens and large accessibility text can scroll within
                    // their page while the shared controls remain on screen.
                  >
                    <View
                      style={{
                        paddingTop: 26 * scale,
                        paddingHorizontal: 24 * scale,
                      }}
                    >
                      <Text
                        accessibilityRole="header"
                        style={[
                          styles.heading,
                          {
                            fontSize: 42 * scale,
                            lineHeight: 46 * scale,
                            minHeight: headingHeight,
                          },
                        ]}
                      >
                        {item.title}
                      </Text>
                      <Text
                        style={[
                          styles.subtitle,
                          {
                            fontSize: 23 * scale,
                            lineHeight: 29 * scale,
                            marginTop: 10 * scale,
                            minHeight: subtitleHeight,
                          },
                        ]}
                      >
                        {item.subtitle}
                      </Text>
                    </View>
                    <View
                      testID={`onboarding-artwork-${index + 1}`}
                      style={[styles.artwork, { height: heroHeight }]}
                    >
                      <View
                        style={{ width: artworkWidth, height: artworkHeight }}
                      >
                        <Image
                          source={item.image}
                          contentFit="contain"
                          style={styles.hero}
                        />
                        {index === 0 && (
                          <View
                            style={{
                              position: "absolute",
                              left: 25 * artworkScale,
                              top: (artworkHeight * 71) / 198,
                              width: 216 * artworkScale,
                            }}
                          >
                            <FeatureCard scale={artworkScale} />
                          </View>
                        )}
                      </View>
                    </View>
                  </ScrollView>
                </View>
              )}
            />
          )}
        </View>

        <View testID="onboarding-controls" style={styles.controls}>
          <View
            style={[styles.pagination, { marginTop: 12 * scale }]}
            accessibilityRole="tablist"
          >
            {slides.map((slide, index) => (
              <Pressable
                key={slide.title}
                accessibilityRole="tab"
                accessibilityLabel={`Introduction ${index + 1} of ${slides.length}`}
                aria-selected={page === index}
                hitSlop={6}
                onPress={() => selectPage(index)}
                style={styles.dotTarget}
              >
                <View
                  style={[styles.dot, page === index && styles.activeDot]}
                />
              </Pressable>
            ))}
          </View>
          <View style={{ paddingHorizontal: 20 * scale }}>
            <Pressable
              accessibilityRole="button"
              onPress={onGetStarted}
              style={({ pressed }) => [
                styles.primaryButton,
                { minHeight: 64 * scale, marginTop: 14 * scale },
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.primaryLabel, { fontSize: 22 * scale }]}>
                Get Started
              </Text>
              <Text
                accessibilityElementsHidden
                importantForAccessibility="no"
                style={[styles.arrow, { fontSize: 28 * scale }]}
              >
                →
              </Text>
            </Pressable>
            <View style={[styles.signInRow, { marginTop: 8 * scale }]}>
              <Text style={[styles.accountText, { fontSize: 17 * scale }]}>
                Already have an account?{" "}
              </Text>
              <Pressable
                accessibilityRole="link"
                hitSlop={8}
                onPress={onSignIn}
                style={({ pressed }) => [
                  styles.signInButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.signInText, { fontSize: 17 * scale }]}>
                  Sign in
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: "center", backgroundColor: colors.background },
  content: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  skipButton: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  skip: { color: "#273B70" },
  carousel: { flex: 1, minHeight: 0 },
  pageContent: { flexGrow: 1 },
  heading: { fontWeight: "700", color: colors.text, letterSpacing: -1.2 },
  subtitle: { color: colors.textSecondary },
  artwork: { alignItems: "center", justifyContent: "center" },
  hero: { width: "100%", height: "100%" },
  controls: { flexShrink: 0 },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dotTarget: {
    minWidth: 18,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: "#C4D0E0" },
  activeDot: { backgroundColor: colors.primary },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 11,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  primaryLabel: { color: "#FFFFFF", fontWeight: "600" },
  arrow: { color: "#FFFFFF", lineHeight: 32, fontWeight: "300" },
  signInRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
  },
  accountText: { color: "#334971", lineHeight: 26 },
  signInButton: { minHeight: 32, justifyContent: "center" },
  signInText: { color: colors.primary, fontWeight: "600" },
  pressed: { opacity: 0.72 },
});
