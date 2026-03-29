#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

// Exposes LiveActivityModule (Swift) to React Native's bridge.

@interface RCT_EXTERN_MODULE(LiveActivityModule, NSObject)

RCT_EXTERN_METHOD(
  startActivity:(NSInteger)elapsedSeconds
  stage:(NSString *)stage
  resolve:(RCTPromiseResolveBlock)resolve
  reject:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  updateActivity:(NSInteger)elapsedSeconds
  stage:(NSString *)stage
  resolve:(RCTPromiseResolveBlock)resolve
  reject:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  endActivity:(RCTPromiseResolveBlock)resolve
  reject:(RCTPromiseRejectBlock)reject
)

@end
