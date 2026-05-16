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
