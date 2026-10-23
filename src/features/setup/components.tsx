import { Image } from "expo-image";
import { useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { BrandLogo } from "@/components/ui/brand-logo";
import { colors } from "@/constants/theme";
import {
  buttonFill,
  invitationTrim,
  setupIcon,
  setupWaves,
  type SetupIconName,
} from "./artwork";

export function useSetupScale() {
  const { width } = useWindowDimensions();
  return Math.min(width, 452) / 393;
}

export function Icon({
  name,
  size = 28,
  color = colors.primary,
  filled = false,
}: {
  name: SetupIconName;
  size?: number;
  color?: string;
  filled?: boolean;
}) {
  return (
    <Image
      source={setupIcon(name, color, filled)}
      style={{ width: size, height: size }}
      contentFit="contain"
    />
  );
}

export function IconTile({
  name,
  size = 64,
  tone = "mint",
}: {
  name: SetupIconName;
  size?: number;
  tone?: "mint" | "blue" | "orange" | "neutral";
}) {
  const palette = {
    mint: ["#E1F8F1", colors.primary],
    blue: ["#E7F2FF", "#0085FF"],
    orange: ["#FFF2E2", "#FF8B00"],
    neutral: ["#F0F5F9", "#334771"],
  }[tone];
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.22,
        backgroundColor: palette[0],
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon
        name={name}
        color={palette[1]}
        size={size * 0.6}
        filled={tone !== "neutral"}
      />
    </View>
  );
}

export function WarehouseDecoration({ header = false }: { header?: boolean }) {
  const scale = useSetupScale();
  return (
    <View
      pointerEvents="none"
      accessible={false}
      style={[
        styles.decoration,
        header
          ? { top: 65 * scale, height: 150 * scale }
          : { bottom: 0, height: 225 * scale },
      ]}
    >
      <Image
        source={setupWaves}
        style={
          header
            ? {
                position: "absolute",
                left: 0,
                right: 0,
                top: 44 * scale,
                bottom: 0,
              }
            : StyleSheet.absoluteFill
        }
        contentFit="fill"
      />
      <Image
        source={require("@/assets/images/setup-warehouse.png")}
        contentFit="contain"
        contentPosition="bottom right"
        style={
          header
            ? {
                position: "absolute",
                right: -160 * scale,
                bottom: 0,
                width: 350 * scale,
                height: 120 * scale,
              }
            : {
                position: "absolute",
                bottom: 0,
                left: -45 * scale,
                width: 520 * scale,
                height: 175 * scale,
              }
        }
      />
      {header ? (
        <Image
          source={invitationTrim}
          contentFit="fill"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: -15 * scale,
            height: 50 * scale,
          }}
        />
      ) : null}
    </View>
  );
}

export function SetupScaffold({
  children,
  onBack,
  decoration,
  success = false,
}: {
  children: ReactNode;
  onBack?: () => void;
  decoration?: "profile" | "invitation";
  success?: boolean;
}) {
  const scale = useSetupScale();
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.screen}>
      {decoration ? (
        <WarehouseDecoration header={decoration === "invitation"} />
      ) : null}
      {success ? (
        <Image
          source={setupWaves}
          contentFit="fill"
          style={{
            position: "absolute",
            bottom: -130 * scale,
            height: 170 * scale,
            width: "100%",
          }}
        />
      ) : null}
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <KeyboardAvoidingView
          style={styles.safe}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            bounces={false}
            automaticallyAdjustKeyboardInsets
            contentContainerStyle={[
              styles.scroll,
              { paddingBottom: Math.max(insets.bottom, 20) },
            ]}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={[
                styles.content,
                decoration === "profile" && { paddingBottom: 180 * scale },
              ]}
            >
              <View
                style={{
                  height: 72 * scale,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {onBack ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Back"
                    hitSlop={8}
                    onPress={onBack}
                    style={[styles.back, { left: 19 * scale }]}
                  >
                    <Icon name="back" color={colors.text} size={26 * scale} />
                  </Pressable>
                ) : null}
                <BrandLogo
                  scale={(decoration === "profile" ? 0.7 : 0.84) * scale}
                />
              </View>
              {children}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

export function Heading({
  title,
  subtitle,
  compact = false,
}: {
  title: string;
  subtitle: string;
  compact?: boolean;
}) {
  const scale = useSetupScale();
  return (
    <View style={{ marginBottom: 28 * scale }}>
      <Text
        accessibilityRole="header"
        style={{
          fontSize: (compact ? 27 : 35) * scale,
          lineHeight: (compact ? 34 : 43) * scale,
          letterSpacing: -1.1 * scale,
          fontWeight: "700",
          color: colors.text,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: 17 * scale,
          lineHeight: 25 * scale,
          marginTop: 7 * scale,
        }}
      >
        {subtitle}
      </Text>
    </View>
  );
}

export function PrimaryButton({
  label = "Continue",
  onPress,
  busy = false,
  disabled = false,
  height = 66,
}: {
  label?: string;
  onPress: () => void;
  busy?: boolean;
  disabled?: boolean;
  height?: number;
}) {
  const scale = useSetupScale();
  return (
    <Pressable
      testID="setup-continue"
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || busy, busy }}
      disabled={disabled || busy}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primary,
        {
          minHeight: height * scale,
          borderRadius: 15 * scale,
          gap: 16 * scale,
        },
        (disabled || busy) && { opacity: 0.6 },
        pressed && { opacity: 0.8 },
      ]}
    >
      <Image
        accessible={false}
        source={buttonFill}
        contentFit="fill"
        style={[StyleSheet.absoluteFill, { borderRadius: 15 * scale }]}
      />
      {busy ? (
        <ActivityIndicator color="white" />
      ) : (
        <>
          <Text
            style={{ color: "white", fontWeight: "600", fontSize: 21 * scale }}
          >
            {label}
          </Text>
          <Icon name="arrow" size={27 * scale} color="white" />
        </>
      )}
    </Pressable>
  );
}

export function ErrorMessage({ message }: { message?: string | null }) {
  return message ? (
    <Text
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={styles.error}
    >
      {message}
    </Text>
  ) : null;
}

export function FormField({
  label,
  value,
  placeholder,
  icon,
  tone,
  onChange,
  onPress,
  error,
  editable = true,
  compact = false,
}: {
  label: string;
  value: string;
  placeholder?: string;
  icon: SetupIconName;
  tone?: "mint" | "blue" | "neutral";
  onChange?: (value: string) => void;
  onPress?: () => void;
  error?: string;
  editable?: boolean;
  compact?: boolean;
}) {
  const scale = useSetupScale();
  const body = (
    <>
      <IconTile name={icon} size={43 * scale} tone={tone} />
      {onPress ? (
        <Text
          style={[
            styles.fieldText,
            {
              fontSize: 17 * scale,
              color: value ? colors.text : colors.textSecondary,
            },
          ]}
        >
          {value || placeholder}
        </Text>
      ) : (
        <TextInput
          accessibilityLabel={label}
          value={value}
          onChangeText={onChange}
          editable={editable}
          placeholder={placeholder}
          placeholderTextColor="#8A99B4"
          autoCapitalize="words"
          returnKeyType="next"
          style={[
            styles.fieldText,
            { fontSize: 17 * scale, paddingVertical: 10 * scale },
          ]}
        />
      )}
      {onPress ? (
        <Icon name="chevron" size={20 * scale} color="#283A67" />
      ) : null}
    </>
  );
  return (
    <View style={{ marginBottom: (compact ? 15 : 16) * scale }}>
      <Text
        style={{
          fontSize: 16 * scale,
          lineHeight: (compact ? 21 : 22) * scale,
          color: colors.text,
          marginBottom: (compact ? 6 : 7) * scale,
        }}
      >
        {label}
      </Text>
      {onPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${label}: ${value || "Choose"}`}
          onPress={onPress}
          style={[styles.field, { minHeight: 54 * scale, gap: 15 * scale }]}
        >
          {body}
        </Pressable>
      ) : (
        <View
          style={[styles.field, { minHeight: 54 * scale, gap: 15 * scale }]}
        >
          {body}
        </View>
      )}
      <ErrorMessage message={error} />
    </View>
  );
}

export function SelectionMark({
  selected,
  size = 28,
}: {
  selected: boolean;
  size?: number;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: selected ? colors.primary : "transparent",
        borderColor: selected ? colors.primary : "#ABB9D0",
        borderWidth: selected ? 0 : 2,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {selected ? <Icon name="check" size={size * 0.68} color="white" /> : null}
    </View>
  );
}

export function ChoiceSheet({
  title,
  value,
  options,
  onSelect,
  onClose,
  custom = false,
}: {
  title: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  onClose: () => void;
  custom?: boolean;
}) {
  const [customValue, setCustomValue] = useState(
    options.includes(value) ? "" : value,
  );
  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable
          accessibilityLabel="Close options"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <View accessibilityViewIsModal style={styles.sheet}>
          <Text accessibilityRole="header" style={styles.sheetTitle}>
            {title}
          </Text>
          <ScrollView keyboardShouldPersistTaps="handled">
            {options.map((option) => (
              <Pressable
                key={option}
                accessibilityRole="radio"
                aria-checked={value === option}
                accessibilityState={{ checked: value === option }}
                onPress={() => {
                  if (custom && option === "Other location") setCustomValue("");
                  else onSelect(option);
                }}
                style={styles.option}
              >
                <Text style={styles.optionText}>{option}</Text>
                <SelectionMark selected={value === option} size={24} />
              </Pressable>
            ))}
          </ScrollView>
          {custom ? (
            <View style={{ marginTop: 16 }}>
              <TextInput
                accessibilityLabel="Custom location"
                placeholder="Enter location name"
                placeholderTextColor={colors.textSecondary}
                value={customValue}
                onChangeText={setCustomValue}
                onSubmitEditing={(event) => {
                  if (event.nativeEvent.text.trim())
                    onSelect(event.nativeEvent.text.trim());
                }}
                style={[
                  styles.field,
                  { paddingHorizontal: 16, minHeight: 50, color: colors.text },
                ]}
                returnKeyType="done"
              />
            </View>
          ) : null}
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              if (custom && customValue.trim()) onSelect(customValue.trim());
              else onClose();
            }}
            style={styles.close}
          >
            <Text
              style={{ color: colors.primary, fontSize: 17, fontWeight: "600" }}
            >
              Done
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export const setupStyles = StyleSheet.create({
  body: { paddingHorizontal: 24 },
  link: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
  },
  linkTarget: { minHeight: 44, alignItems: "center", justifyContent: "center" },
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, overflow: "hidden" },
  safe: { flex: 1 },
  scroll: { flexGrow: 1, alignItems: "center" },
  content: { width: "100%", maxWidth: 452 },
  decoration: { position: "absolute", left: 0, right: 0 },
  back: {
    position: "absolute",
    minWidth: 44,
    minHeight: 44,
    alignItems: "flex-start",
    justifyContent: "center",
    zIndex: 1,
  },
  primary: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    boxShadow: "0 7px 15px rgba(0, 133, 116, 0.13)",
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
    paddingRight: 15,
    borderColor: "#DCE5F2",
    borderWidth: 1,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
  },
  fieldText: { flex: 1, color: colors.text, minWidth: 0 },
  error: { fontSize: 14, lineHeight: 20, color: "#A32935", marginVertical: 8 },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(12,16,59,.28)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 22,
    width: "100%",
    maxWidth: 410,
    maxHeight: "80%",
  },
  sheetTitle: {
    fontSize: 23,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 16,
  },
  option: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  optionText: { flex: 1, color: colors.text, fontSize: 17 },
  close: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
});
