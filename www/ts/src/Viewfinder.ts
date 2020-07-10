/// <amd-module name="scandit-cordova-datacapture-core.Viewfinder"/>
// ^ needed because Cordova can't resolve "../xx" style dependencies
import { Color, NumberWithUnit, SizeWithUnit, SizeWithUnitAndAspect } from './Common';
import { Cordova } from './Cordova/Cordova';
import { DefaultSerializeable, nameForSerialization } from './Serializeable';

export interface PrivateBrush {
  toJSON(): BrushJSON;
}

export interface BrushJSON {
  fill: { color: Color };
  stroke: { color: Color, width: number };
}

export class Brush extends DefaultSerializeable {
  private fill: { color: Color };
  private stroke: { color: Color, width: number };

  public static get transparent(): Brush {
    const transparentBlack = Color.fromRGBA(255, 255, 255, 0);
    return new Brush(transparentBlack, transparentBlack, 0);
  }

  public get fillColor(): Color {
    return this.fill.color;
  }

  public get strokeColor(): Color {
    return this.stroke.color;
  }

  public get strokeWidth(): number {
    return this.stroke.width;
  }

  public constructor()
  public constructor(fillColor: Color, strokeColor: Color, strokeWidth: number)
  constructor(
    fillColor: Color = Cordova.defaults.Brush.fillColor,
    strokeColor: Color = Cordova.defaults.Brush.strokeColor,
    strokeWidth: number = Cordova.defaults.Brush.strokeWidth,
  ) {
    super();
    this.fill = { color: fillColor };
    this.stroke = { color: strokeColor, width: strokeWidth };
  }
}

// tslint:disable-next-line:no-empty-interface
export interface Viewfinder { }

// tslint:disable-next-line:variable-name
export const NoViewfinder = { type: 'none' };

export class LaserlineViewfinder extends DefaultSerializeable implements Viewfinder {
  private type = 'laserline';

  public width: NumberWithUnit = Cordova.defaults.LaserlineViewfinder.width;
  public enabledColor: Color = Cordova.defaults.LaserlineViewfinder.enabledColor;
  public disabledColor: Color = Cordova.defaults.LaserlineViewfinder.disabledColor;

  public constructor() {
    super();
  }
}

export class RectangularViewfinder extends DefaultSerializeable implements Viewfinder {
  private type = 'rectangular';

  @nameForSerialization('size')
  private _sizeWithUnitAndAspect: SizeWithUnitAndAspect = Cordova.defaults.RectangularViewfinder.size;

  public color: Color = Cordova.defaults.RectangularViewfinder.color;

  public get sizeWithUnitAndAspect(): SizeWithUnitAndAspect {
    return this._sizeWithUnitAndAspect;
  }

  public constructor() {
    super();
  }

  public setSize(size: SizeWithUnit): void {
    this._sizeWithUnitAndAspect = (SizeWithUnitAndAspect as any).sizeWithWidthAndHeight(size);
  }

  public setWidthAndAspectRatio(width: NumberWithUnit, heightToWidthAspectRatio: number): void {
    this._sizeWithUnitAndAspect = (SizeWithUnitAndAspect as any).sizeWithWidthAndAspectRatio(width,
      heightToWidthAspectRatio);
  }

  public setHeightAndAspectRatio(height: NumberWithUnit, widthToHeightAspectRatio: number): void {
    this._sizeWithUnitAndAspect = (SizeWithUnitAndAspect as any).sizeWithHeightAndAspectRatio(height,
      widthToHeightAspectRatio);
  }
}

export class SpotlightViewfinder extends DefaultSerializeable implements Viewfinder {
  private type = 'spotlight';

  @nameForSerialization('size')
  private _sizeWithUnitAndAspect: SizeWithUnitAndAspect = Cordova.defaults.SpotlightViewfinder.size;

  public enabledBorderColor: Color = Cordova.defaults.SpotlightViewfinder.enabledBorderColor;
  public disabledBorderColor: Color = Cordova.defaults.SpotlightViewfinder.disabledBorderColor;
  public backgroundColor: Color = Cordova.defaults.SpotlightViewfinder.backgroundColor;

  public get sizeWithUnitAndAspect(): SizeWithUnitAndAspect {
    return this._sizeWithUnitAndAspect;
  }

  public constructor() {
    super();
  }

  public setSize(size: SizeWithUnit): void {
    this._sizeWithUnitAndAspect = (SizeWithUnitAndAspect as any).sizeWithWidthAndHeight(size);
  }

  public setWidthAndAspectRatio(width: NumberWithUnit, heightToWidthAspectRatio: number): void {
    this._sizeWithUnitAndAspect = (SizeWithUnitAndAspect as any).sizeWithWidthAndAspectRatio(width,
      heightToWidthAspectRatio);
  }

  public setHeightAndAspectRatio(height: NumberWithUnit, widthToHeightAspectRatio: number): void {
    this._sizeWithUnitAndAspect = (SizeWithUnitAndAspect as any).sizeWithHeightAndAspectRatio(height,
      widthToHeightAspectRatio);
  }
}
