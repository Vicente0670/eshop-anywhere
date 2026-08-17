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
  },
  Query: {
    Name: "Query Settings",
    Key: "settings-query",
    IsQuery: true
  }
}

export interface Setting {
  [Setting: string]: SettingsLayout;
}

export interface SettingsLayout {
  Name: string,
  Key: string,
  Type?: "checkbox" | "range",
  Value?: boolean | string | number,
  IsQuery?: boolean,
}

export const SettingNames: string[] = Object.keys(Settings);

export function returnSettingType(id: string, settings: Setting): boolean {
  switch (id) {
    case settings.Muted.Key:
      return settings.Muted.Value as boolean || Settings.Muted.Value as boolean;

    case settings.Effects.Key:
      return settings.Effects.Value as boolean || Settings.Effects.Value as boolean;

    case settings.Continuous.Key:
      return settings.Continuous.Value as boolean || Settings.Continuous.Value as boolean;

    default:
      return false;
  }
}