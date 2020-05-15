var GeoUtil = (function () {
  // 百度坐标（BD09ll）、国测局坐标（火星坐标，GCJ02）、和WGS84坐标系之间的转换
  // https://github.com/wandergis/coordtransform
  // 改进了是否在中国的坐标判断

  //定义一些常量
  var x_PI = 3.14159265358979324 * 3000.0 / 180.0;
  var PI = 3.1415926535897932384626;
  var a = 6378245.0;
  var ee = 0.00669342162296594323;

  // GCJ-02 -> BD-09ll
  // point: {lng, lat}
  function gcj02_to_bd09ll(point) {
    var x = point.lng,
      y = point.lat;
    var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_PI);
    var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * x_PI);
    var bd_lon = z * Math.cos(theta) + 0.0065;
    var bd_lat = z * Math.sin(theta) + 0.006;
    return {
      lng: bd_lon,
      lat: bd_lat
    };
  }

  // BD-09 -> GCJ-02
  // point: {lng, lat}
  function bd09ll_to_gcj02(point) {
    var x = point.lng - 0.0065,
      y = point.lat - 0.006;
    var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_PI);
    var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_PI);

    return {
      lng: z * Math.cos(theta),
      lat: z * Math.sin(theta)
    };
  }

  // WGS-84 -> GCJ-02
  // point: {lng, lat}
  function wgs84_to_gcj02(point) {

    var wgLat = point.lat,
      wgLon = point.lng;

    if (isInChina(wgLon, wgLat)) {
      var dLat = transformLat(wgLon - 105.0, wgLat - 35.0);
      var dLon = transformLon(wgLon - 105.0, wgLat - 35.0);
      var radLat = wgLat / 180.0 * PI;
      var magic = Math.sin(radLat);
      magic = 1 - ee * magic * magic;
      var sqrtMagic = Math.sqrt(magic);
      dLat = dLat * 180.0 / (a * (1 - ee) / (magic * sqrtMagic) * PI);
      dLon = dLon * 180.0 / (a / sqrtMagic * Math.cos(radLat) * PI);

      return {
        lng: wgLon + dLon,
        lat: wgLat + dLat
      };
    } else {
      return {
        lng: wgLon,
        lat: wgLat
      };
    }
  }

  // GCJ-02 -> WGS-84
  // point: {lng, lat}
  function gcj02_to_wgs84(point) {
    var lat = +point.lat;
    var lng = +point.lng;
    if (!isInChina(lng, lat)) {
      return point;
    } else {
      var dlat = transformLat(lng - 105.0, lat - 35.0);
      var dlng = transformLon(lng - 105.0, lat - 35.0);
      var radlat = lat / 180.0 * PI;
      var magic = Math.sin(radlat);
      magic = 1 - ee * magic * magic;
      var sqrtmagic = Math.sqrt(magic);
      dlat = dlat * 180.0 / (a * (1 - ee) / (magic * sqrtmagic) * PI);
      dlng = dlng * 180.0 / (a / sqrtmagic * Math.cos(radlat) * PI);
      var mglat = lat + dlat;
      var mglng = lng + dlng;
      return { lng: lng * 2 - mglng, lat: lat * 2 - mglat };
    }
  }

  // WGS-84 -> BD-09ll
  // point: {lng, lat}
  function wgs84_to_bd09ll(point) {
    return gcj02_to_bd09ll(wgs84_to_gcj02(point));
  }

  // BD-09ll -> WGS-84
  // point: {lng, lat}
  function bd09ll_to_wgs84(point) {
    return gcj02_to_wgs84(bd09ll_to_gcj02(point));
  }

  // 判断GPS坐标是否在中国
  // http://www.cnblogs.com/Aimeast/archive/2012/08/09/2629614.html
  // https://git.load-page.com/r/laravel/blob/cc16b6522d68231c4949251c3886691256b6bb5e/vendor/addons/core/src/Tools/GPS.php
  function Rectangle(lng1, lat1, lng2, lat2) {
    this.west = Math.min(lng1, lng2);
    this.north = Math.max(lat1, lat2);
    this.east = Math.max(lng1, lng2);
    this.south = Math.min(lat1, lat2);
  }

  function isInRect(rect, lon, lat) {
    return rect.west <= lon && rect.east >= lon && rect.north >= lat && rect.south <= lat;
  }
  //China region - raw data
  var region = [new Rectangle(79.446200, 49.220400, 96.330000, 42.889900), new Rectangle(109.687200, 54.141500, 135.000200, 39.374200), new Rectangle(73.124600, 42.889900, 124.143255, 29.529700), new Rectangle(82.968400, 29.529700, 97.035200, 26.718600), new Rectangle(97.025300, 29.529700, 124.367395, 20.414096), new Rectangle(107.975793, 20.414096, 111.744104, 17.871542)];
  //China excluded region - raw data
  var exclude = [new Rectangle(119.921265, 25.398623, 122.497559, 21.785006), new Rectangle(101.865200, 22.284000, 106.665000, 20.098800), new Rectangle(106.452500, 21.542200, 108.051000, 20.487800), new Rectangle(109.032300, 55.817500, 119.127000, 50.325700), new Rectangle(127.456800, 55.817500, 137.022700, 49.557400), new Rectangle(131.266200, 44.892200, 137.022700, 42.569200)];

  function isInChina(lon, lat) {
    for (var i = 0; i < region.length; i++) {
      if (isInRect(region[i], lon, lat)) {
        for (var j = 0; j < exclude.length; j++) {
          if (isInRect(exclude[j], lon, lat)) {
            return false;
          }
        }
        return true;
      }
    }
    return false;
  }

  function transformLat(x, y) {
    var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(y * PI) + 40.0 * Math.sin(y / 3.0 * PI)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(y / 12.0 * PI) + 320 * Math.sin(y * PI / 30.0)) * 2.0 / 3.0;
    return ret;
  }

  function transformLon(x, y) {
    var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(x * PI) + 40.0 * Math.sin(x / 3.0 * PI)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(x / 12.0 * PI) + 300.0 * Math.sin(x / 30.0 * PI)) * 2.0 / 3.0;
    return ret;
  }

  var module = {
    gcj02_to_bd09ll: gcj02_to_bd09ll,
    bd09ll_to_gcj02: bd09ll_to_gcj02,
    wgs84_to_gcj02: wgs84_to_gcj02,
    gcj02_to_wgs84: gcj02_to_wgs84,
    wgs84_to_bd09ll: wgs84_to_bd09ll,
    bd09ll_to_wgs84: bd09ll_to_wgs84
  };

  // srcCoordType/targetCoordType: [wgs84, gcj02, bd09ll]
  function transform(point, srcCoordType, targetCoordType) {
    if (srcCoordType == targetCoordType) {
      return point;
    } else {
      var transformFunc = srcCoordType + "_to_" + targetCoordType;
      return module[transformFunc](point);
    }
  }
  window.GeoUtil = {
    transform: transform,
    isInChina: isInChina
  };
  return {
    transform: transform,
    isInChina: isInChina
  };
})();