import { isArrayEqual } from "./Constants";

// Default
export const Settings: Setting = {
  Volume: {
    Name: "Volume",
    Key: "settings-volume",
    Type: "range",
    Value: 20
  },
  Muted: {
    Name: "Muted",
    Key: "settings-muted",
    Type: "checkbox",
    Value: false
  },
  Loop: {
    Name: "Loop",
    Key: "settings-loop",
    Type: "checkbox",
    Value: false
  },
  Grace: {
    Name: "Stop on Mute",
    Key: "settings-grace",
    Type: "checkbox",
    Value: false
  },
  Continuous: {
    Name: "Continuous Background Play",
    Key: "settings-continuous",
    Type: "checkbox",
    Value: false
  },
  Effects: {
    Name: "SFX",
    Key: "settings-sfx",
    Type: "checkbox",
    Value: false
  },
  Resume: {
    Name: "Resume Playback",
    Key: "settings-resume",
    Type: "checkbox",
    Value: true
  },
  Track: {
    Name: "Track Number",
    Key: "settings-track",
    Type: "number",
    Value: 0
  }
}

export const SettingDescriptions: SettingInfo = {
  Volume: "Controls playback loudness.\nAt least now you know.",
  Muted: "If true, music volume is disabled.\nNote that after 30 seconds of no sound (including setting the Volume to 0%), playback will cease until you resume browser activity with a shopping site open.\nTo bypass this, enable the \"Continuous\" feature.",
  Loop: "Loops the current track. If false, plays the next track in the sequence.",
  Grace: "Pauses playback while muted or at 0% volume. Is not dependent on your PC volume, only the extension volume. Sorry about that.",
  Continuous: "Continues music as normal as if the player always exists. Must have a shopping site open to continue playback.",
  Effects: "Plays sound effects from the 3DS while browsing a shopping site.",
  Resume: "Plays the music you last left off when you return to a shopping site.",
  Track: "The current song that is currently playing."
}

export const SettingNames: string[] = Object.keys(Settings);

export const SettingQuery: string = "settings-query";

export interface SettingsLayout {
  Name: string,
  Key: SettingKeys,
  Type: "checkbox" | "number" | "range",
  Value: boolean | string | number
}

export type Setting = {
  [Setting in SettingIds]: SettingsLayout;
};

export type SettingInfo = {
  [Setting in SettingIds]: string;
}

export type SettingIds =
  "Volume" |
  "Muted" |
  "Loop" |
  "Grace" |
  "Continuous" |
  "Effects" |
  "Resume" |
  "Track";

export type SettingKeys =
  "settings-volume" |
  "settings-muted" |
  "settings-loop" |
  "settings-grace" |
  "settings-continuous" |
  "settings-sfx" |
  "settings-resume" |
  "settings-track";

export function verifySettings(imported: Setting): Setting {
  const importedNames = Object.keys(imported);
  if (isArrayEqual(importedNames, SettingNames))
    return imported;

  const defaultNameSet = new Set(SettingNames);
  const importedNameSet = new Set(importedNames);

  importedNameSet.forEach((name: string) => {
    if (!defaultNameSet.has(name))
      delete imported[name as SettingIds];
  });

  defaultNameSet.forEach((name: string) => {
    const id = name as SettingIds;
    if (!importedNameSet.has(id))
      imported[id] = Settings[id];
  });

  return imported;
}