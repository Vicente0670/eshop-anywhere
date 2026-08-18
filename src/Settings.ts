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
  Effects: {
    Name: "SFX",
    Key: "settings-sfx",
    Type: "checkbox",
    Value: false
  },
  Continuous: {
    Name: "Continuous Background Play",
    Key: "settings-continuous",
    Type: "checkbox",
    Value: false
  }
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
};;

export type SettingIds =
  "Volume" |
  "Muted" |
  "Effects" |
  "Continuous";

export type SettingKeys =
  "settings-volume" |
  "settings-muted" |
  "settings-sfx" |
  "settings-continuous";