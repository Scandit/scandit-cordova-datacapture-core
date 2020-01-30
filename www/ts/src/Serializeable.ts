/// <amd-module name="scandit-cordova-datacapture-core.Serializeable"/>
// ^ needed because Cordova can't resolve "../xx" style dependencies
export interface Serializeable {
  toJSON: () => object;
}

export interface StringSerializeable {
  toJSON: () => string;
}

// tslint:disable-next-line:ban-types
export function ignoreFromSerialization(target: any, propertyName: string) {
  target.ignoredProperties = target.ignoredProperties || [];
  target.ignoredProperties.push(propertyName);
}

// tslint:disable-next-line:ban-types
export function nameForSerialization(customName: string) {
  return (target: any, propertyName: string) => {
    target.customPropertyNames = target.customPropertyNames || {};
    target.customPropertyNames[propertyName] = customName;
  };
}

// tslint:disable-next-line:ban-types
export function ignoreFromSerializationIfNull(target: any, propertyName: string) {
  target.ignoredIfNullProperties = target.ignoredIfNullProperties || [];
  target.ignoredIfNullProperties.push(propertyName);
}

// tslint:disable-next-line:ban-types
export function serializationDefault(defaultValue: any) {
  return (target: any, propertyName: string) => {
    target.customPropertyDefaults = target.customPropertyDefaults || {};
    target.customPropertyDefaults[propertyName] = defaultValue;
  };
}

export class DefaultSerializeable implements Serializeable {
  public toJSON(): object {
    const properties = Object.keys(this);

    // use @ignoreFromSerialization to ignore properties
    const ignoredProperties = (this as any).ignoredProperties || [];

    // use @ignoreFromSerializationIfNull to ignore properties if they're null
    const ignoredIfNullProperties = (this as any).ignoredIfNullProperties || [];

    // use @nameForSerialization('customName') to rename properties in the JSON output
    const customPropertyNames = (this as any).customPropertyNames || {};

    // use @serializationDefault({}) to use a different value in the JSON output if they're null
    const customPropertyDefaults = (this as any).customPropertyDefaults || {};

    return properties.reduce((json, property) => {
      if (ignoredProperties.includes(property)) {
        return json;
      }

      let value = (this as any)[property];

      if (value === undefined) {
        return json;
      }

      // Ignore if it's null and should be ignored.
      // This is basically responsible for not including optional properties in the JSON if they're null,
      // as that's not always deserialized to mean the same as not present.
      if (value === null && ignoredIfNullProperties.includes(property)) {
        return json;
      }

      if (value === null && customPropertyDefaults[property] !== undefined) {
        value = customPropertyDefaults[property];
      }

      // Serialize if serializeable
      if (value != null && value.toJSON) {
        value = value.toJSON();
      }

      // Serialize the array if the elements are serializeable
      if (Array.isArray(value)) {
        value = value.map(e => e.toJSON ? e.toJSON() : e);
      }

      const propertyName = customPropertyNames[property] || property;

      (json as any)[propertyName] = value;
      return json;
    }, {});
  }
}
