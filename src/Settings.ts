export const DefaultSettings: Settings = {
  Volume: {
    Name: "Volume",
    Key: "settings-volume",
    Type: "range",
    Value: 25
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
    Name: "Continuous Play",
    Key: "settings-continuous",
    Type: "checkbox",
    Value: false
  }
}

export interface Settings {
  [Setting: string]: SettingsLayout;
}

export interface SettingsLayout {
  Name: string,
  Key: string,
  Type: "checkbox" | "range",
  Value?: boolean | number,
}