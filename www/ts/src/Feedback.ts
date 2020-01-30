/// <amd-module name="scandit-cordova-datacapture-core.Feedback"/>
// ^ needed because Cordova can't resolve "../xx" style dependencies
import { DefaultSerializeable, ignoreFromSerializationIfNull, nameForSerialization } from './Serializeable';

export class Vibration extends DefaultSerializeable {
  public static get defaultVibration(): Vibration {
    return new Vibration();
  }
}

export class Sound extends DefaultSerializeable {
  @ignoreFromSerializationIfNull
  public resource: Optional<string> = null;

  public static get defaultSound(): Sound {
    return new Sound(null);
  }

  constructor(resource: Optional<string>) {
    super();
    this.resource = resource;
  }
}

export class Feedback extends DefaultSerializeable {
  public static get defaultFeedback(): Feedback {
    return new Feedback(Vibration.defaultVibration, Sound.defaultSound);
  }

  @ignoreFromSerializationIfNull
  @nameForSerialization('vibration')
  private _vibration: Optional<Vibration> = null;
  @ignoreFromSerializationIfNull
  @nameForSerialization('sound')
  private _sound: Optional<Sound> = null;

  public get vibration(): Optional<Vibration> {
    return this._vibration;
  }
  public get sound(): Optional<Sound> {
    return this._sound;
  }

  public constructor(vibration: Optional<Vibration>, sound: Optional<Sound>) {
    super();
    this._vibration = vibration;
    this._sound = sound;
  }
}
