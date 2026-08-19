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
    Value: false,
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
  }
}

export const SettingDescriptions: SettingInfo = {
  Volume: "",
  Muted: "",
  Loop: "",
  Continuous: "",
  Effects: "",
}

export const SettingNames: string[] = Object.keys(Settings);

export const SettingQuery: string = "settings-query";

export interface SettingsLayout {
  Name: string,
  Key: SettingKeys,
  Type: "checkbox" | "range",
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
  "Continuous" |
  "Effects";

export type SettingKeys =
  "settings-volume" |
  "settings-muted" |
  "settings-loop" |
  "settings-continuous" |
  "settings-sfx";

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