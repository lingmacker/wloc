const coordinateScale = 100000000;
const boundsKeys = [
  "minLatitude",
  "maxLatitude",
  "minLongitude",
  "maxLongitude",
];

function optionalNumber(value, name) {
  if (value == null || (typeof value === "string" && !value.trim()))
    return null;
  if (typeof value === "string") {
    value = value.trim().replace(",", ".");
    if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(value)) {
      throw new Error(`${name} 必须是有效数字`);
    }
    value = Number(value);
  }
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${name} 必须是有限数字`);
  }
  return value;
}

function coordinate(value, name, limit) {
  const number = optionalNumber(value, name);
  if (number != null && Math.abs(number) > limit) {
    throw new Error(`${name} 必须在 ${-limit} 到 ${limit} 之间`);
  }
  return number;
}

// Work on the protobuf's 1e-8 degree grid so rounding cannot escape a narrow box.
function coordinateTick(value, round) {
  return Number(value.toFixed(8)) === value
    ? Math.round(value * coordinateScale)
    : round(value * coordinateScale);
}

export function normalizeLocationSettings(
  input = {},
  { requireCoordinates = false } = {},
) {
  const settings = {
    ...input,
    longitude: coordinate(input.longitude, "longitude", 180),
    latitude: coordinate(input.latitude, "latitude", 90),
    accuracy: optionalNumber(input.accuracy, "accuracy") ?? 25,
    altitude: optionalNumber(input.altitude, "altitude"),
    randomRadius: optionalNumber(input.randomRadius, "randomRadius") ?? 0,
    randomMode: input.randomMode == null ? "" : String(input.randomMode).trim(),
    minLatitude: coordinate(input.minLatitude, "minLatitude", 90),
    maxLatitude: coordinate(input.maxLatitude, "maxLatitude", 90),
    minLongitude: coordinate(input.minLongitude, "minLongitude", 180),
    maxLongitude: coordinate(input.maxLongitude, "maxLongitude", 180),
    logLevel: input.logLevel ?? "info",
  };
  if (!Number.isSafeInteger(settings.accuracy) || settings.accuracy < 0) {
    throw new Error("accuracy 必须是非负安全整数（米）");
  }
  if (settings.altitude != null) {
    settings.altitude = Math.trunc(settings.altitude);
    if (!Number.isSafeInteger(settings.altitude)) {
      throw new Error("altitude 超出安全整数范围");
    }
  }
  if (settings.randomRadius < 0) throw new Error("randomRadius 不能为负数");
  settings.randomMode ||= settings.randomRadius > 0 ? "radius" : "fixed";
  if (!["fixed", "radius", "bounds"].includes(settings.randomMode)) {
    throw new Error("randomMode 必须是 fixed、radius 或 bounds");
  }
  if (settings.randomMode === "bounds") {
    if (boundsKeys.some((key) => settings[key] == null)) {
      throw new Error("范围随机需要完整的经度和纬度上下限");
    }
    for (const axis of ["Latitude", "Longitude"]) {
      const minimum = settings[`min${axis}`];
      const maximum = settings[`max${axis}`];
      if (minimum > maximum)
        throw new Error(`min${axis} 不能大于 max${axis}（不支持跨 180° 经线）`);
      if (
        coordinateTick(minimum, Math.ceil) > coordinateTick(maximum, Math.floor)
      ) {
        throw new Error(`${axis} 范围内没有可编码的坐标（精度为 0.00000001°）`);
      }
    }
    settings.latitude ??= (settings.minLatitude + settings.maxLatitude) / 2;
    settings.longitude ??= (settings.minLongitude + settings.maxLongitude) / 2;
  }
  if (
    (settings.longitude == null) !== (settings.latitude == null) ||
    (requireCoordinates && settings.longitude == null)
  ) {
    throw new Error("请同时提供有效的 longitude/lon 和 latitude/lat");
  }
  return settings;
}

function randomCoordinate(minimum, maximum) {
  const firstTick = coordinateTick(minimum, Math.ceil);
  const lastTick = coordinateTick(maximum, Math.floor);
  return (
    (firstTick + Math.floor(Math.random() * (lastTick - firstTick + 1))) /
    coordinateScale
  );
}

export function selectTargetSettings(settings) {
  if (settings.randomMode === "bounds") {
    return {
      ...settings,
      latitude: randomCoordinate(settings.minLatitude, settings.maxLatitude),
      longitude: randomCoordinate(settings.minLongitude, settings.maxLongitude),
    };
  }
  if (settings.randomMode !== "radius" || settings.randomRadius === 0)
    return settings;
  const distanceMeters = Math.sqrt(Math.random()) * settings.randomRadius;
  const bearingRadians = 2 * Math.random() * Math.PI;
  const angularDistance = distanceMeters / 6378137;
  const latitudeRadians = (settings.latitude * Math.PI) / 180;
  const longitudeRadians = (settings.longitude * Math.PI) / 180;
  const targetLatitudeRadians = Math.asin(
    Math.sin(latitudeRadians) * Math.cos(angularDistance) +
      Math.cos(latitudeRadians) *
        Math.sin(angularDistance) *
        Math.cos(bearingRadians),
  );
  const targetLongitudeRadians =
    ((longitudeRadians +
      Math.atan2(
        Math.sin(bearingRadians) *
          Math.sin(angularDistance) *
          Math.cos(latitudeRadians),
        Math.cos(angularDistance) -
          Math.sin(latitudeRadians) * Math.sin(targetLatitudeRadians),
      ) +
      3 * Math.PI) %
      (2 * Math.PI)) -
    Math.PI;
  return {
    ...settings,
    latitude: Number(((targetLatitudeRadians * 180) / Math.PI).toFixed(8)),
    longitude: Number(((targetLongitudeRadians * 180) / Math.PI).toFixed(8)),
    randomDistance: distanceMeters,
  };
}
