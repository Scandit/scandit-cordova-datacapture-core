/// <amd-module name="scandit-cordova-datacapture-core.Common"/>
// ^ needed because Cordova can't resolve "../xx" style dependencies
import { DefaultSerializeable, nameForSerialization, Serializeable, StringSerializeable } from './Serializeable';

export interface PointJSON { x: number; y: number; }

export interface PrivatePoint {
  fromJSON(json: PointJSON): Point;
}

export class Point extends DefaultSerializeable {
  @nameForSerialization('x')
  private _x: number;
  @nameForSerialization('y')
  private _y: number;

  public get x(): number {
    return this._x;
  }

  public get y(): number {
    return this._y;
  }

  private static fromJSON(json: PointJSON): Point {
    return new Point(json.x, json.y);
  }

  constructor(
    x: number,
    y: number,
  ) {
    super();
    this._x = x;
    this._y = y;
  }
}

export interface QuadrilateralJSON {
  topLeft: PointJSON;
  topRight: PointJSON;
  bottomRight: PointJSON;
  bottomLeft: PointJSON;
}

export interface PrivateQuadrilateral {
  fromJSON(json: QuadrilateralJSON): Quadrilateral;
}

export class Quadrilateral extends DefaultSerializeable {
  @nameForSerialization('topLeft')
  private _topLeft: Point;
  @nameForSerialization('topRight')
  private _topRight: Point;
  @nameForSerialization('bottomRight')
  private _bottomRight: Point;
  @nameForSerialization('bottomLeft')
  private _bottomLeft: Point;

  public get topLeft(): Point {
    return this._topLeft;
  }

  public get topRight(): Point {
    return this._topRight;
  }

  public get bottomRight(): Point {
    return this._bottomRight;
  }

  public get bottomLeft(): Point {
    return this._bottomLeft;
  }

  private static fromJSON(json: QuadrilateralJSON): Quadrilateral {
    return new Quadrilateral(
      (Point as any as PrivatePoint).fromJSON(json.topLeft),
      (Point as any as PrivatePoint).fromJSON(json.topRight),
      (Point as any as PrivatePoint).fromJSON(json.bottomRight),
      (Point as any as PrivatePoint).fromJSON(json.bottomLeft),
    );
  }

  constructor(
    topLeft: Point,
    topRight: Point,
    bottomRight: Point,
    bottomLeft: Point,
  ) {
    super();
    this._topLeft = topLeft;
    this._topRight = topRight;
    this._bottomRight = bottomRight;
    this._bottomLeft = bottomLeft;
  }
}

export enum MeasureUnit {
  DIP = 'dip',
  Pixel = 'pixel',
  Fraction = 'fraction',
}

export interface NumberWithUnitJSON { value: number; unit: string; }

export interface PrivateNumberWithUnit {
  fromJSON(json: NumberWithUnitJSON): NumberWithUnit;
}

export class NumberWithUnit extends DefaultSerializeable {
  @nameForSerialization('value')
  private _value: number;
  @nameForSerialization('unit')
  private _unit: MeasureUnit;

  public get value(): number {
    return this._value;
  }

  public get unit(): MeasureUnit {
    return this._unit;
  }

  private static fromJSON(json: NumberWithUnitJSON): NumberWithUnit {
    return new NumberWithUnit(json.value, json.unit as MeasureUnit);
  }

  constructor(
    value: number,
    unit: MeasureUnit,
  ) {
    super();
    this._value = value;
    this._unit = unit;
  }
}

export interface PointWithUnitJSON { x: NumberWithUnitJSON; y: NumberWithUnitJSON; }

export interface PrivatePointWithUnit {
  readonly zero: PointWithUnit;
  fromJSON(json: PointWithUnitJSON): PointWithUnit;
}

export class PointWithUnit extends DefaultSerializeable {
  @nameForSerialization('x')
  private _x: NumberWithUnit;
  @nameForSerialization('y')
  private _y: NumberWithUnit;

  public get x(): NumberWithUnit {
    return this._x;
  }

  public get y(): NumberWithUnit {
    return this._y;
  }

  private static fromJSON(json: PointWithUnitJSON): PointWithUnit {
    return new PointWithUnit(
      (NumberWithUnit as any as PrivateNumberWithUnit).fromJSON(json.x),
      (NumberWithUnit as any as PrivateNumberWithUnit).fromJSON(json.y),
    );
  }

  private static get zero(): PointWithUnit {
    return new PointWithUnit(
      new NumberWithUnit(0, MeasureUnit.Pixel),
      new NumberWithUnit(0, MeasureUnit.Pixel),
    );
  }

  constructor(
    x: NumberWithUnit,
    y: NumberWithUnit,
  ) {
    super();
    this._x = x;
    this._y = y;
  }
}

export class RectWithUnit extends DefaultSerializeable {
  @nameForSerialization('origin')
  private _origin: PointWithUnit;
  @nameForSerialization('size')
  private _size: SizeWithUnit;

  public get origin(): PointWithUnit {
    return this._origin;
  }
  public get size(): SizeWithUnit {
    return this._size;
  }

  constructor(
    origin: PointWithUnit,
    size: SizeWithUnit,
  ) {
    super();
    this._origin = origin;
    this._size = size;
  }
}

export class SizeWithUnit extends DefaultSerializeable {
  @nameForSerialization('width')
  private _width: NumberWithUnit;
  @nameForSerialization('height')
  private _height: NumberWithUnit;

  public get width(): NumberWithUnit {
    return this._width;
  }

  public get height(): NumberWithUnit {
    return this._height;
  }

  constructor(width: NumberWithUnit, height: NumberWithUnit) {
    super();
    this._width = width;
    this._height = height;
  }
}

export interface SizeJSON { width: number; height: number; }
export class Size extends DefaultSerializeable {
  @nameForSerialization('width')
  private _width: number;
  @nameForSerialization('height')
  private _height: number;

  public get width(): number {
    return this._width;
  }
  public get height(): number {
    return this._height;
  }

  private static fromJSON(json: SizeJSON): Size {
    return new Size(json.width, json.height);
  }

  constructor(
    width: number,
    height: number,
  ) {
    super();
    this._width = width;
    this._height = height;
  }
}

export class SizeWithAspect {
  @nameForSerialization('size')
  private _size: NumberWithUnit;
  @nameForSerialization('aspect')
  private _aspect: number;

  public get size(): NumberWithUnit {
    return this._size;
  }
  public get aspect(): number {
    return this._aspect;
  }

  constructor(
    size: NumberWithUnit,
    aspect: number,
  ) {
    this._size = size;
    this._aspect = aspect;
  }
}

export enum SizingMode {
  WidthAndHeight = 'widthAndHeight',
  WidthAndAspectRatio = 'widthAndAspectRatio',
  HeightAndAspectRatio = 'heightAndAspectRatio',
}

export interface SizeWithUnitAndAspectJSON {
  width?: NumberWithUnitJSON;
  height?: NumberWithUnitJSON;
  aspect?: number;
}

export interface PrivateSizeWithUnitAndAspect {
  fromJSON(json: SizeWithUnitAndAspectJSON): SizeWithUnitAndAspect;
}

export class SizeWithUnitAndAspect implements Serializeable {
  @nameForSerialization('widthAndHeight')
  private _widthAndHeight: Optional<SizeWithUnit>;
  @nameForSerialization('widthAndAspectRatio')
  private _widthAndAspectRatio: Optional<SizeWithAspect>;
  @nameForSerialization('heightAndAspectRatio')
  private _heightAndAspectRatio: Optional<SizeWithAspect>;

  public get widthAndHeight(): Optional<SizeWithUnit> {
    return this._widthAndHeight;
  }

  public get widthAndAspectRatio(): Optional<SizeWithAspect> {
    return this._widthAndAspectRatio;
  }

  public get heightAndAspectRatio(): Optional<SizeWithAspect> {
    return this._heightAndAspectRatio;
  }

  public get sizingMode(): SizingMode {
    if (this.widthAndAspectRatio) {
      return SizingMode.WidthAndAspectRatio;
    }
    if (this.heightAndAspectRatio) {
      return SizingMode.HeightAndAspectRatio;
    }
    return SizingMode.WidthAndHeight;
  }

  private static sizeWithWidthAndHeight(widthAndHeight: SizeWithUnit): SizeWithUnitAndAspect {
    const sizeWithUnitAndAspect = new SizeWithUnitAndAspect();
    sizeWithUnitAndAspect._widthAndHeight = widthAndHeight;
    return sizeWithUnitAndAspect;
  }

  private static sizeWithWidthAndAspectRatio(width: NumberWithUnit, aspectRatio: number): SizeWithUnitAndAspect {
    const sizeWithUnitAndAspect = new SizeWithUnitAndAspect();
    sizeWithUnitAndAspect._widthAndAspectRatio = new SizeWithAspect(width, aspectRatio);
    return sizeWithUnitAndAspect;
  }

  private static sizeWithHeightAndAspectRatio(height: NumberWithUnit, aspectRatio: number): SizeWithUnitAndAspect {
    const sizeWithUnitAndAspect = new SizeWithUnitAndAspect();
    sizeWithUnitAndAspect._heightAndAspectRatio = new SizeWithAspect(height, aspectRatio);
    return sizeWithUnitAndAspect;
  }

  private static fromJSON(json: SizeWithUnitAndAspectJSON): SizeWithUnitAndAspect {
    if (json.width && json.height) {
      return this.sizeWithWidthAndHeight(
        new SizeWithUnit(
          (NumberWithUnit as any as PrivateNumberWithUnit).fromJSON(json.width),
          (NumberWithUnit as any as PrivateNumberWithUnit).fromJSON(json.height),
        ));
    } else if (json.width && json.aspect) {
      return this.sizeWithWidthAndAspectRatio(
        (NumberWithUnit as any as PrivateNumberWithUnit).fromJSON(json.width),
        json.aspect,
      );
    } else if (json.height && json.aspect) {
      return this.sizeWithHeightAndAspectRatio(
        (NumberWithUnit as any as PrivateNumberWithUnit).fromJSON(json.height),
        json.aspect,
      );
    } else {
      throw new Error(`SizeWithUnitAndAspectJSON is malformed: ${JSON.stringify(json)}`);
    }
  }

  // no member access so our coverage check doesn't pick it up
  // TODO: https://jira.scandit.com/browse/SDC-1773
  // tslint:disable-next-line:member-access
  toJSON(): object {
    switch (this.sizingMode) {
      case SizingMode.WidthAndAspectRatio:
        return {
          width: this.widthAndAspectRatio!.size.toJSON(),
          aspect: this.widthAndAspectRatio!.aspect,
        };

      case SizingMode.HeightAndAspectRatio:
        return {
          height: this.heightAndAspectRatio!.size.toJSON(),
          aspect: this.heightAndAspectRatio!.aspect,
        };

      default:
        return {
          width: this.widthAndHeight!.width.toJSON(),
          height: this.widthAndHeight!.height.toJSON(),
        };
    }
  }
}

export interface MarginsWithUnitJSON {
  left: NumberWithUnitJSON;
  right: NumberWithUnitJSON;
  top: NumberWithUnitJSON;
  bottom: NumberWithUnitJSON;
}

export interface PrivateMarginsWithUnit {
  readonly zero: MarginsWithUnit;
  fromJSON(json: MarginsWithUnitJSON): MarginsWithUnit;
}

export class MarginsWithUnit extends DefaultSerializeable {
  @nameForSerialization('left')
  private _left: NumberWithUnit;
  @nameForSerialization('right')
  private _right: NumberWithUnit;
  @nameForSerialization('top')
  private _top: NumberWithUnit;
  @nameForSerialization('bottom')
  private _bottom: NumberWithUnit;

  public get left(): NumberWithUnit {
    return this._left;
  }

  public get right(): NumberWithUnit {
    return this._right;
  }

  public get top(): NumberWithUnit {
    return this._top;
  }

  public get bottom(): NumberWithUnit {
    return this._bottom;
  }

  private static fromJSON(json: MarginsWithUnitJSON): MarginsWithUnit {
    return new MarginsWithUnit(
      (NumberWithUnit as any as PrivateNumberWithUnit).fromJSON(json.left),
      (NumberWithUnit as any as PrivateNumberWithUnit).fromJSON(json.right),
      (NumberWithUnit as any as PrivateNumberWithUnit).fromJSON(json.top),
      (NumberWithUnit as any as PrivateNumberWithUnit).fromJSON(json.bottom),
    );
  }

  private static get zero(): MarginsWithUnit {
    return new MarginsWithUnit(
      new NumberWithUnit(0, MeasureUnit.Pixel),
      new NumberWithUnit(0, MeasureUnit.Pixel),
      new NumberWithUnit(0, MeasureUnit.Pixel),
      new NumberWithUnit(0, MeasureUnit.Pixel),
    );
  }

  constructor(
    left: NumberWithUnit,
    right: NumberWithUnit,
    top: NumberWithUnit,
    bottom: NumberWithUnit,
  ) {
    super();
    this._left = left;
    this._right = right;
    this._top = top;
    this._bottom = bottom;
  }
}

type ColorJSON = string;

export interface PrivateColor {
  fromJSON(json: ColorJSON): Color;
}

export class Color implements StringSerializeable {
  private hexadecimalString: string;

  public get redComponent(): string {
    return this.hexadecimalString.slice(0, 2);
  }

  public get greenComponent(): string {
    return this.hexadecimalString.slice(2, 4);
  }

  public get blueComponent(): string {
    return this.hexadecimalString.slice(4, 6);
  }

  public get alphaComponent(): string {
    return this.hexadecimalString.slice(6, 8);
  }

  public get red(): number {
    return Color.hexToNumber(this.redComponent);
  }

  public get green(): number {
    return Color.hexToNumber(this.greenComponent);
  }

  public get blue(): number {
    return Color.hexToNumber(this.blueComponent);
  }

  public get alpha(): number {
    return Color.hexToNumber(this.alphaComponent);
  }

  public static fromHex(hex: string): Color {
    return new Color(Color.normalizeHex(hex));
  }

  public static fromRGBA(red: number, green: number, blue: number, alpha: number = 1): Color {
    const hexString = [red, green, blue, this.normalizeAlpha(alpha)]
      .reduce((hex, colorComponent) => hex + this.numberToHex(colorComponent), '');
    return new Color(hexString);
  }

  private static hexToNumber(hex: string): number {
    return parseInt(hex, 16);
  }

  private static fromJSON(json: ColorJSON): Color {
    return Color.fromHex(json);
  }

  private static numberToHex(x: number): string {
    x = Math.round(x);
    let hex = x.toString(16);
    if (hex.length === 1) {
      hex = '0' + hex;
    }
    return hex.toUpperCase();
  }

  private static normalizeHex(hex: string): string {
    // remove leading #
    if (hex[0] === '#') {
      hex = hex.slice(1);
    }

    // double digits if single digit
    if (hex.length < 6) {
      hex = hex.split('').map(s => s + s).join('');
    }

    // add alpha if missing
    if (hex.length === 6) {
      hex = hex + 'FF';
    }

    return hex.toUpperCase();
  }

  private static normalizeAlpha(alpha: number): number {
    if (alpha > 0 && alpha <= 1) {
      return 255 * alpha;
    }
    return alpha;
  }

  private constructor(hex: string) {
    this.hexadecimalString = hex;
  }

  public withAlpha(alpha: number): Color {
    const newHex = this.hexadecimalString.slice(0, 6) + Color.numberToHex(Color.normalizeAlpha(alpha));
    return Color.fromHex(newHex);
  }

  // no member access so our coverage check doesn't pick it up
  // TODO: https://jira.scandit.com/browse/SDC-1773
  // tslint:disable-next-line:member-access
  toJSON(): string {
    return this.hexadecimalString;
  }
}

export enum Orientation {
  Unknown = 'unknown',
  Portrait = 'portrait',
  PortraitUpsideDown = 'portraitUpsideDown',
  LandscapeRight = 'landscapeRight',
  LandscapeLeft = 'landscapeLeft',
}
