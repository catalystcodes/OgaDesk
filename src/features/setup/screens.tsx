import { Image } from "expo-image";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors } from "@/constants/theme";
import { celebration } from "./artwork";
import {
  ChoiceSheet,
  ErrorMessage,
  FormField,
  Heading,
  Icon,
  IconTile,
  PrimaryButton,
  SelectionMark,
  SetupScaffold,
  setupStyles,
  useSetupScale,
} from "./components";
import { businessTypes, locations } from "./model";
import type { SetupScreenProps, SetupRole } from "./types";

const roles: {
  role: SetupRole;
  description: string;
  icon: "business" | "people" | "person";
  tone: "mint" | "blue" | "orange";
}[] = [
  {
    role: "Owner",
    description: "Full access to all features",
    icon: "business",
    tone: "mint",
  },
  {
    role: "Manager",
    description: "Manage stock, team and reports",
    icon: "people",
    tone: "blue",
  },
  {
    role: "Staff",
    description: "Stock operations and counting only",
    icon: "person",
    tone: "orange",
  },
];

export function SetupScreen(props: SetupScreenProps) {
  const {
    step,
    draft,
    onChange,
    onBack,
    onContinue,
    busy,
    loading,
    error,
    fieldErrors,
    choices,
  } = props;
  const scale = useSetupScale();
  const [sheet, setSheet] = useState<
    "businessType" | "location" | "role" | null
  >(null);
  const selected = choices.find((choice) => choice.id === draft.selectedId);
  const padding = { paddingHorizontal: 24 * scale };

  if (step === "create-profile")
    return (
      <SetupScaffold onBack={onBack} decoration="profile">
        <View style={[padding, { marginTop: 2 * scale }]}>
          <Heading
            compact
            title="Tell us about your business"
            subtitle="Let’s set up your organisation details."
          />
          <FormField
            compact
            label="Business name"
            value={draft.businessName}
            placeholder="Your business name"
            icon="building"
            onChange={(businessName) => onChange({ businessName })}
            error={fieldErrors?.businessName}
          />
          <FormField
            compact
            label="Business type"
            value={draft.businessType}
            icon="package"
            tone="blue"
            onPress={() => setSheet("businessType")}
            error={fieldErrors?.businessType}
          />
          <FormField
            compact
            label="Primary location"
            value={draft.location}
            icon="pin"
            onPress={() => setSheet("location")}
            error={fieldErrors?.location}
          />
          <FormField
            compact
            label="Your full name"
            value={draft.fullName}
            placeholder="Your full name"
            icon="person"
            tone="neutral"
            onChange={(fullName) => onChange({ fullName })}
            error={fieldErrors?.fullName}
          />
          <ErrorMessage message={error} />
          <View style={{ marginTop: 4 * scale }}>
            <PrimaryButton onPress={onContinue} busy={busy} height={58} />
          </View>
        </View>
        {sheet ? (
          <ChoiceSheet
            title={
              sheet === "businessType" ? "Business type" : "Primary location"
            }
            value={
              sheet === "businessType" ? draft.businessType : draft.location
            }
            options={sheet === "businessType" ? businessTypes : locations}
            custom={sheet === "location"}
            onSelect={(value) => {
              onChange({ [sheet]: value });
              setSheet(null);
            }}
            onClose={() => setSheet(null)}
          />
        ) : null}
      </SetupScaffold>
    );

  if (step === "select-role")
    return (
      <SetupScaffold onBack={onBack}>
        <View style={[padding, { marginTop: 34 * scale }]}>
          <Heading
            title="What’s your role?"
            subtitle="This helps us personalise your experience."
          />
          <View
            accessibilityRole="radiogroup"
            style={{ gap: 18 * scale, marginTop: 4 * scale }}
          >
            {roles.map((option) => (
              <Pressable
                key={option.role}
                accessibilityRole="radio"
                accessibilityLabel={option.role}
                aria-checked={draft.role === option.role}
                accessibilityState={{ checked: draft.role === option.role }}
                onPress={() => onChange({ role: option.role })}
                style={[
                  styles.choice,
                  {
                    minHeight: 116 * scale,
                    padding: 18 * scale,
                    gap: 20 * scale,
                    borderRadius: 16 * scale,
                  },
                  draft.role === option.role && styles.selected,
                ]}
              >
                <IconTile
                  name={option.icon}
                  tone={option.tone}
                  size={70 * scale}
                />
                <View style={{ flex: 1, gap: 7 * scale }}>
                  <Text style={[styles.choiceTitle, { fontSize: 22 * scale }]}>
                    {option.role}
                  </Text>
                  <Text
                    style={[
                      styles.description,
                      { fontSize: 17 * scale, lineHeight: 24 * scale },
                    ]}
                  >
                    {option.description}
                  </Text>
                </View>
                <View
                  style={{
                    position: "absolute",
                    right: 16 * scale,
                    top: 32 * scale,
                  }}
                >
                  <SelectionMark
                    selected={draft.role === option.role}
                    size={28 * scale}
                  />
                </View>
              </Pressable>
            ))}
          </View>
          <ErrorMessage message={error} />
          <View style={{ marginTop: 32 * scale }}>
            <PrimaryButton onPress={onContinue} busy={busy} height={72} />
          </View>
        </View>
      </SetupScaffold>
    );

  if (step === "select-organisation")
    return (
      <SetupScaffold onBack={onBack}>
        <View
          style={[{ paddingHorizontal: 18 * scale, marginTop: 34 * scale }]}
        >
          <View style={{ paddingHorizontal: 7 * scale }}>
            <Heading
              title="Select organisation"
              subtitle="Choose the organisation you want to access."
            />
          </View>
          {loading ? (
            <ActivityIndicator
              accessibilityLabel="Loading your organisations"
              color={colors.primary}
              style={{ padding: 30 }}
            />
          ) : null}
          <View accessibilityRole="radiogroup" style={{ gap: 13 * scale }}>
            {choices.map((choice) => (
              <Pressable
                key={choice.id}
                accessibilityRole="radio"
                accessibilityLabel={choice.name}
                aria-checked={draft.selectedId === choice.id}
                accessibilityState={{ checked: draft.selectedId === choice.id }}
                onPress={() => onChange({ selectedId: choice.id })}
                style={[
                  styles.choice,
                  {
                    minHeight: 94 * scale,
                    padding: 13 * scale,
                    gap: 16 * scale,
                    borderRadius: 14 * scale,
                  },
                  draft.selectedId === choice.id && styles.selected,
                ]}
              >
                {choice.image ? (
                  <Image
                    source={choice.image}
                    style={{
                      width: 70 * scale,
                      height: 70 * scale,
                      borderRadius: 11 * scale,
                    }}
                    contentFit="cover"
                  />
                ) : (
                  <IconTile name="building" size={70 * scale} tone="blue" />
                )}
                <View style={{ flex: 1, gap: 8 * scale }}>
                  <Text style={[styles.choiceTitle, { fontSize: 19 * scale }]}>
                    {choice.name}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 6 * scale,
                      alignItems: "center",
                    }}
                  >
                    <Icon name="pin" size={16 * scale} color="#6C7FA0" />
                    <Text
                      style={[
                        styles.description,
                        { fontSize: 17 * scale, flex: 1 },
                      ]}
                    >
                      {choice.location}
                    </Text>
                  </View>
                </View>
                <View style={{ marginLeft: -16 * scale }}>
                  <SelectionMark
                    selected={draft.selectedId === choice.id}
                    size={30 * scale}
                  />
                </View>
              </Pressable>
            ))}
            {!loading && choices.length === 0 ? (
              <View style={[styles.empty, { padding: 24 * scale }]}>
                <IconTile name="building" tone="blue" />
                <Text
                  style={[
                    styles.choiceTitle,
                    { fontSize: 21 * scale, marginTop: 16 },
                  ]}
                >
                  No organisations yet
                </Text>
                <Text
                  style={[
                    styles.description,
                    {
                      fontSize: 16 * scale,
                      lineHeight: 24 * scale,
                      marginTop: 8,
                    },
                  ]}
                >
                  Create an organisation, or ask your administrator for an
                  invitation.
                </Text>
                {props.onRefresh ? (
                  <Pressable
                    onPress={props.onRefresh}
                    accessibilityRole="button"
                    style={setupStyles.linkTarget}
                  >
                    <Text style={setupStyles.link}>Check for invitations</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
            <Pressable
              accessibilityRole="button"
              onPress={props.onAddOrganisation}
              style={[
                styles.choice,
                {
                  minHeight: 92 * scale,
                  padding: 13 * scale,
                  gap: 22 * scale,
                  borderRadius: 14 * scale,
                },
              ]}
            >
              <IconTile name="plus" tone="neutral" size={70 * scale} />
              <Text
                style={[styles.description, { fontSize: 20 * scale, flex: 1 }]}
              >
                Add another organisation
              </Text>
            </Pressable>
          </View>
          {props.onLoadMore ? (
            <Pressable
              accessibilityRole="button"
              onPress={props.onLoadMore}
              style={setupStyles.linkTarget}
            >
              <Text style={setupStyles.link}>Load more organisations</Text>
            </Pressable>
          ) : null}
          <ErrorMessage message={error} />
          <View style={{ marginTop: 26 * scale, paddingHorizontal: 6 * scale }}>
            <PrimaryButton
              onPress={onContinue}
              disabled={!selected || loading}
              busy={busy}
              height={72}
            />
          </View>
        </View>
      </SetupScaffold>
    );

  if (step === "join-organisation")
    return (
      <SetupScaffold onBack={onBack} decoration="invitation">
        <View style={[padding, { marginTop: 92 * scale }]}>
          <Heading
            title="Join your organisation"
            subtitle={
              "You’ve been invited to join an organisation.\nReview the details below."
            }
          />
          {selected ? (
            <>
              <View
                style={[
                  styles.invitation,
                  {
                    minHeight: 107 * scale,
                    padding: 14 * scale,
                    gap: 17 * scale,
                    borderRadius: 13 * scale,
                  },
                ]}
              >
                <IconTile name="building" tone="blue" size={64 * scale} />
                <View style={{ flex: 1, gap: 6 * scale }}>
                  <Text style={[styles.choiceTitle, { fontSize: 20 * scale }]}>
                    {selected.name}
                  </Text>
                  {selected.inviterName ? (
                    <Text
                      style={[styles.description, { fontSize: 17 * scale }]}
                    >
                      Invited by {selected.inviterName}
                    </Text>
                  ) : (
                    <Text
                      style={[styles.description, { fontSize: 16 * scale }]}
                    >
                      You have an invitation to join
                    </Text>
                  )}
                  {selected.inviterEmail ? (
                    <Text
                      style={[styles.description, { fontSize: 16 * scale }]}
                    >
                      {selected.inviterEmail}
                    </Text>
                  ) : null}
                </View>
              </View>
              <View style={{ marginTop: 22 * scale }}>
                <FormField
                  label="Your role"
                  value={selected.roleLabel || selected.role}
                  icon="person"
                  tone="neutral"
                  onPress={() => setSheet("role")}
                />
              </View>
              <View style={{ marginTop: 7 * scale }}>
                <FormField
                  label="Location"
                  value={selected.location}
                  icon="pin"
                  onPress={() => setSheet("location")}
                />
              </View>
              <ErrorMessage message={error} />
              <View style={{ marginTop: 6 * scale }}>
                <PrimaryButton
                  label="Join Organisation"
                  onPress={onContinue}
                  busy={busy}
                  height={65}
                />
              </View>
            </>
          ) : (
            <ErrorMessage message="Choose an invitation from your organisation list to continue." />
          )}
          <Pressable
            accessibilityRole="link"
            onPress={props.onAddOrganisation}
            style={[setupStyles.linkTarget, { marginTop: 14 * scale }]}
          >
            <Text style={[setupStyles.link, { fontSize: 16 * scale }]}>
              Set up a new organisation instead
            </Text>
          </Pressable>
        </View>
        {sheet && selected ? (
          <ChoiceSheet
            title={sheet === "role" ? "Assigned role" : "Organisation location"}
            options={[
              sheet === "role"
                ? selected.roleLabel || selected.role
                : selected.location,
            ]}
            value={
              sheet === "role"
                ? selected.roleLabel || selected.role
                : selected.location
            }
            onSelect={() => setSheet(null)}
            onClose={() => setSheet(null)}
          />
        ) : null}
      </SetupScaffold>
    );

  if (step === "review-confirm") {
    const entries = [
      {
        label: "Organisation",
        value: selected?.name || draft.businessName,
        extra: draft.location,
        icon: "building" as const,
        tone: "mint" as const,
        field: "organisation" as const,
      },
      {
        label: "Your role",
        value: selected?.roleLabel || selected?.role || draft.role,
        icon: "person" as const,
        tone: "blue" as const,
        field: "role" as const,
      },
      {
        label: "Business type",
        value: draft.businessType,
        icon: "boxes" as const,
        tone: "mint" as const,
        field: "businessType" as const,
      },
      {
        label: "Location",
        value: draft.location,
        icon: "pin" as const,
        tone: "mint" as const,
        field: "location" as const,
      },
    ];
    return (
      <SetupScaffold onBack={onBack}>
        <View
          style={[{ paddingHorizontal: 20 * scale, marginTop: 34 * scale }]}
        >
          <View style={{ paddingHorizontal: 5 * scale }}>
            <Heading
              title="Review and confirm"
              subtitle={
                "Here’s a summary of your setup.\nYou can edit any details before continuing."
              }
            />
          </View>
          <View style={{ gap: 12 * scale }}>
            {entries.map((entry) => (
              <View
                key={entry.label}
                style={[
                  styles.summaryRow,
                  {
                    minHeight: (entry.extra ? 106 : 86) * scale,
                    padding: 13 * scale,
                    borderRadius: 15 * scale,
                    gap: 16 * scale,
                  },
                ]}
              >
                <IconTile
                  name={entry.icon}
                  tone={entry.tone}
                  size={60 * scale}
                />
                <View style={{ flex: 1, gap: 5 * scale }}>
                  <Text style={[styles.description, { fontSize: 17 * scale }]}>
                    {entry.label}
                  </Text>
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: 18 * scale,
                      lineHeight: 24 * scale,
                    }}
                  >
                    {entry.value}
                  </Text>
                  {entry.extra ? (
                    <Text
                      style={[styles.description, { fontSize: 16 * scale }]}
                    >
                      {entry.extra}
                    </Text>
                  ) : null}
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${entry.field === "role" && selected?.kind !== "create" ? "View" : "Edit"} ${entry.label}`}
                  disabled={busy}
                  onPress={() => {
                    if (entry.field === "role" && selected?.kind !== "create") {
                      setSheet("role");
                      return;
                    }
                    if (
                      entry.field === "businessType" ||
                      entry.field === "location"
                    )
                      setSheet(entry.field);
                    else props.onEdit(entry.field);
                  }}
                  style={{ minHeight: 44, justifyContent: "center" }}
                >
                  <Text
                    style={{
                      color: colors.primary,
                      fontSize: 17 * scale,
                      fontWeight: "600",
                    }}
                  >
                    {entry.field === "role" && selected?.kind !== "create" ? "View" : "Edit"}
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
          <ErrorMessage message={error} />
          <View style={{ marginTop: 24 * scale }}>
            <PrimaryButton
              label="Confirm and Continue"
              onPress={onContinue}
              disabled={!selected}
              busy={busy}
              height={65}
            />
          </View>
        </View>
        {sheet ? (
          <ChoiceSheet
            title={
              sheet === "role" ? "Assigned role" : sheet === "businessType" ? "Business type" : "Primary location"
            }
            value={sheet === "role" ? selected?.roleLabel || selected?.role || draft.role : draft[sheet]}
            options={sheet === "role" ? [selected?.roleLabel || selected?.role || draft.role] : sheet === "businessType" ? businessTypes : locations}
            custom={sheet === "location"}
            onSelect={(value) => {
              if (sheet !== "role") onChange({ [sheet]: value });
              setSheet(null);
            }}
            onClose={() => setSheet(null)}
          />
        ) : null}
      </SetupScaffold>
    );
  }

  return (
    <SetupScaffold success>
      <View style={[padding, { alignItems: "center", marginTop: 5 * scale }]}>
        <Image
          source={celebration}
          contentFit="contain"
          style={{ width: "100%", height: 237 * scale }}
        />
        <Text
          accessibilityRole="header"
          style={{
            color: colors.text,
            fontSize: 47 * scale,
            lineHeight: 57 * scale,
            fontWeight: "700",
            letterSpacing: -1.4,
          }}
        >
          All set!
        </Text>
        <Text
          style={[
            styles.description,
            {
              fontSize: 19 * scale,
              lineHeight: 26 * scale,
              marginTop: 6 * scale,
              textAlign: "center",
            },
          ]}
        >
          {"Your account has been created and\nyou’re ready to go."}
        </Text>
        <View
          style={[
            styles.successList,
            {
              padding: 18 * scale,
              borderRadius: 16 * scale,
              marginTop: 24 * scale,
              gap: 14 * scale,
            },
          ]}
        >
          {[
            "Account created",
            selected?.kind === "create"
              ? "Organisation created"
              : "Organisation joined",
            "Membership verified",
            "You’re all set!",
          ].map((label) => (
            <View
              key={label}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 26 * scale,
              }}
            >
              <SelectionMark selected size={30 * scale} />
              <Text
                style={{ color: colors.text, fontSize: 18 * scale, flex: 1 }}
              >
                {label}
              </Text>
            </View>
          ))}
        </View>
        <ErrorMessage message={error} />
        <View style={{ marginTop: 24 * scale, width: "100%" }}>
          <PrimaryButton
            label="Go to Dashboard"
            onPress={onContinue}
            busy={busy}
            height={62}
          />
        </View>
      </View>
    </SetupScaffold>
  );
}

const styles = StyleSheet.create({
  choice: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E1EAF3",
    backgroundColor: "#FFFFFF",
    boxShadow: "0 3px 8px rgba(31, 66, 104, .025)",
  },
  selected: {
    borderColor: "#00A58B",
    borderWidth: 2,
    backgroundColor: "#F4FCF9",
  },
  choiceTitle: { color: colors.text, fontWeight: "700", letterSpacing: -0.55 },
  description: { color: colors.textSecondary },
  empty: { borderWidth: 1, borderColor: colors.border, borderRadius: 14 },
  invitation: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DCE9FC",
    backgroundColor: "#F6FAFF",
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E8F4",
    backgroundColor: "#FFFFFF",
  },
  successList: {
    alignSelf: "stretch",
    borderWidth: 1.5,
    borderColor: "#E7EDF4",
    backgroundColor: "#FFFFFF",
  },
});
