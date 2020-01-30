/// <amd-module name="scandit-cordova-datacapture-core.LocationSelection"/>
// ^ needed because Cordova can't resolve "../xx" style dependencies
import { NumberWithUnit, SizeWithUnit, SizeWithUnitAndAspect } from './Common';
import { DefaultSerializeable, nameForSerialization } from './Serializeable';

// tslint:disable-next-line:no-empty-interface
export interface LocationSelection { }

// tslint:disable-next-line:variable-name
export const NoneLocationSelection = { type: 'none' };

export class RadiusLocationSelection extends DefaultSerializeable implements LocationSelection {
  private type = 'radius';

  @nameForSerialization('radius')
  private _radius: NumberWithUnit;

  public get radius(): NumberWithUnit {
    return this._radius;
  }

  public constructor(radius: NumberWithUnit) {
    super();
    this._radius = radius;
  }
}

export class RectangularLocationSelection extends DefaultSerializeable implements LocationSelection {
  private type = 'rectangular';

  @nameForSerialization('size')
  private _sizeWithUnitAndAspect: SizeWithUnitAndAspect;

  public get sizeWithUnitAndAspect(): SizeWithUnitAndAspect {
    return this._sizeWithUnitAndAspect;
  }

  public static withSize(size: SizeWithUnit): RectangularLocationSelection {
    const locationSelection = new RectangularLocationSelection();
    locationSelection._sizeWithUnitAndAspect = (SizeWithUnitAndAspect as any).sizeWithWidthAndHeight(size);
    return locationSelection;
  }

  public static withWidthAndAspectRatio(
    width: NumberWithUnit, heightToWidthAspectRatio: number): RectangularLocationSelection {
    const locationSelection = new RectangularLocationSelection();
    locationSelection._sizeWithUnitAndAspect = (SizeWithUnitAndAspect as any)
      .sizeWithWidthAndAspectRatio(width, heightToWidthAspectRatio);
    return locationSelection;
  }

  public static withHeightAndAspectRatio(
    height: NumberWithUnit, widthToHeightAspectRatio: number): RectangularLocationSelection {
    const locationSelection = new RectangularLocationSelection();
    locationSelection._sizeWithUnitAndAspect = (SizeWithUnitAndAspect as any)
      .sizeWithHeightAndAspectRatio(height, widthToHeightAspectRatio);
    return locationSelection;
  }
}
