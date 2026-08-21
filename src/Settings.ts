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
    Name: "Continuous BG Play",
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
// Add descIds or smth to use the popover api and to fix the layering issues
export const SettingDescriptions: SettingInfo = {
  Volume: {
    Id: "description-volume",
    Description: "Controls playback loudness.\n\n...At least now you know."
  },
  Muted: {
    Id: "description-muted",
    Description: "Mutes the music.\nNote: After 30s of no music, playback ceases until you resume activity with a shopping site.\nBypass this using the \"Continuous BG Play\" toggle."
  },
  Loop: {
    Id: "description-loop",
    Description: "Loops the current track. Otherwise, plays the next track in the sequence."
  },
  Grace: {
    Id: "description-grace",
    Description: "Pauses playback while muted or at 0% volume. Is not dependent on your PC's volume, only the extension's volume. Sorry about that."
  },
  Continuous: {
    Id: "description-continuous",
    Description: "Continues music as normal as if the player always exists. Must have a shopping site open to continue playback."
  },
  Effects: {
    Id: "description-sfx",
    Description: "Plays sound effects from the 3DS while browsing a shopping site."
  },
  Resume: {
    Id: "description-resume",
    Description: "Plays the music you last left off when you return to a shopping site."
  },
  Track: {
    Id: "description-track",
    Description: "The song that is currently playing."
  }
}

export const SettingNames: string[] = Object.keys(Settings);

export const SettingQuery: string = "settings-query";

export interface SettingsLayout {
  Name: string,
  Key: SettingKeys,
  Type: "checkbox" | "number" | "range",
  Value: boolean | string | number
}

export interface SettingInfoLayout {
  Id: SettingDescIds,
  Description: string
}

export type Setting = {
  [Setting in SettingIds]: SettingsLayout;
};

export type SettingInfo = {
  [Setting in SettingIds]: SettingInfoLayout;
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

export type SettingDescIds =
  "description-volume" |
  "description-muted" |
  "description-loop" |
  "description-grace" |
  "description-continuous" |
  "description-sfx" |
  "description-resume" |
  "description-track";

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