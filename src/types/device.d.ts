interface DeviceMotionEventConstructor {
  requestPermission?: () => Promise<PermissionState>;
}

interface DeviceOrientationEventConstructor {
  requestPermission?: () => Promise<PermissionState>;
}

interface Window {
  DeviceMotionEvent?: DeviceMotionEventConstructor;
  DeviceOrientationEvent?: DeviceOrientationEventConstructor;
}

interface DeviceOrientationEvent {
  webkitCompassHeading?: number;
}

interface BatteryManager extends EventTarget {
  charging: boolean;
  level: number;
}

interface Navigator {
  getBattery?: () => Promise<BatteryManager>;
  connection?: {
    effectiveType?: string;
    type?: string;
  };
}
