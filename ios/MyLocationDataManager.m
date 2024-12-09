//
//  MyLocationDataManager.m
//  ExperionActivityTracker
//
//  Created by Arjun on 04/02/20.
//  Copyright © 2020 Facebook. All rights reserved.
//

//#import "MyLocationDataManager.h"
//#import <React/RCTLog.h>
//#import <CoreLocation/CLError.h>
//#import <CoreLocation/CLLocationManager.h>
//#import <CoreLocation/CLLocationManagerDelegate.h>
//
//@implementation MyLocationDataManager
//{
//    CLLocationManager * locationManager;
//    NSDictionary<NSString *, id> * lastLocationEvent;
//}
//
//- (dispatch_queue_t)methodQueue
//{
//    return dispatch_get_main_queue();
//}
//RCT_EXPORT_MODULE()
//
//- (NSArray<NSString *> *)supportedEvents {
//    return @[@"significantLocationChange"];
//}
//
//RCT_EXPORT_METHOD(start) {
//    if (!locationManager)
//        locationManager = [[CLLocationManager alloc] init];
//
//    locationManager.delegate = self;
//
//    if ([locationManager respondsToSelector:@selector(requestAlwaysAuthorization)]) {
//        [locationManager requestAlwaysAuthorization];
//    } else if ([locationManager respondsToSelector:@selector(requestWhenInUseAuthorization)]) {
//        [locationManager requestWhenInUseAuthorization];
//    }
//
//    [locationManager startMonitoringSignificantLocationChanges];
//}
//
//RCT_EXPORT_METHOD(stop) {
//    if (!locationManager)
//        return;
//
//    [locationManager stopMonitoringSignificantLocationChanges];
//}
//
//- (void)locationManager:(CLLocationManager *)manager didUpdateLocations:(NSArray *)locations {
//    CLLocation* location = [locations lastObject];
//  NSLog(@"Location updated");
//    lastLocationEvent = @{
//                          @"coords": @{
//                                  @"latitude": @(location.coordinate.latitude),
//                                  @"longitude": @(location.coordinate.longitude),
//                                  @"altitude": @(location.altitude),
//                                  @"accuracy": @(location.horizontalAccuracy),
//                                  @"altitudeAccuracy": @(location.verticalAccuracy),
//                                  @"heading": @(location.course),
//                                  @"speed": @(location.speed),
//                                  },
//                          @"timestamp": @([location.timestamp timeIntervalSince1970] * 1000) // in ms
//                          };
//
//    [self sendEventWithName:@"significantLocationChange" body:lastLocationEvent];
//}
//
//@end
//


#import "MyLocationDataManager.h"
#import <React/RCTLog.h>
#import <CoreLocation/CLError.h>
#import <CoreLocation/CLLocationManager.h>
#import <CoreLocation/CLLocationManagerDelegate.h>

@implementation MyLocationDataManager
{
  CLLocationManager * locationManager;
  NSDictionary<NSString *, id> * lastLocationEvent;
      bool hasListeners;
}

- (dispatch_queue_t)methodQueue
{
  return dispatch_get_main_queue();
}

RCT_EXPORT_MODULE(MyLocationDataManager);

- (NSDictionary *)constantsToExport
{
  return @{ @"listOfPermissions": @[@"significantLocationChange"] };
}

+ (BOOL)requiresMainQueueSetup
{
  return YES;  // only do this if your module exports constants or calls UIKit
}

//all methods currently async
RCT_EXPORT_METHOD(initialize:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
  RCTLogInfo(@"Pretending to do something natively: initialize");

  resolve(@(true));
}


RCT_EXPORT_METHOD(hasPermissions:(NSString *)permissionType
                 hasPermissionsWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
  RCTLogInfo(@"Pretending to do something natively: hasPermissions %@", permissionType);
  
  BOOL locationAllowed = [CLLocationManager locationServicesEnabled];
  
  resolve(@(locationAllowed));
}

RCT_EXPORT_METHOD(requestPermissions:(NSString *)permissionType
                 requestPermissionsWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  NSArray *arbitraryReturnVal = @[@"testing..."];
  RCTLogInfo(@"Pretending to do something natively: requestPermissions %@", permissionType);
  
  // location
  if (!locationManager) {
    RCTLogInfo(@"init locationManager...");
    locationManager = [[CLLocationManager alloc] init];
  }
  
  locationManager.delegate = self;
  if ([locationManager respondsToSelector:@selector(requestAlwaysAuthorization)]) {
    [locationManager requestAlwaysAuthorization];
  } else if ([locationManager respondsToSelector:@selector(requestWhenInUseAuthorization)]) {
    [locationManager requestWhenInUseAuthorization];
  }

  [locationManager startUpdatingLocation];
  [locationManager startMonitoringSignificantLocationChanges];

  resolve(arbitraryReturnVal);
}
//RCT_EXPORT_METHOD(start)
//{
//  NSArray *arbitraryReturnVal = @[@"testing..."];
////  RCTLogInfo(@"Pretending to do something natively: requestPermissions %@", permissionType);
//
//  // location
//  if (!locationManager) {
//    RCTLogInfo(@"init locationManager...");
//    locationManager = [[CLLocationManager alloc] init];
//  }
//
//  locationManager.delegate = self;
//  locationManager.allowsBackgroundLocationUpdates = true;
//  locationManager.pausesLocationUpdatesAutomatically = true;
//
//  if ([locationManager respondsToSelector:@selector(requestAlwaysAuthorization)]) {
//    [locationManager requestAlwaysAuthorization];
//  } else if ([locationManager respondsToSelector:@selector(requestWhenInUseAuthorization)]) {
//    [locationManager requestWhenInUseAuthorization];
//  }
//
//  [locationManager startUpdatingLocation];
//  [locationManager startMonitoringSignificantLocationChanges];
//
////  resolve(arbitraryReturnVal);
//}
RCT_EXPORT_METHOD(start) {
    if (!locationManager)
        locationManager = [[CLLocationManager alloc] init];
    
    locationManager.delegate = self;
    locationManager.allowsBackgroundLocationUpdates = true;
    locationManager.pausesLocationUpdatesAutomatically = false;
    locationManager.desiredAccuracy = kCLLocationAccuracyBestForNavigation;
    locationManager.showsBackgroundLocationIndicator = true;
    locationManager.activityType = CLActivityTypeFitness;
    locationManager.distanceFilter = 10;
    if ([locationManager respondsToSelector:@selector(requestAlwaysAuthorization)]) {
        [locationManager requestAlwaysAuthorization];
    } else if ([locationManager respondsToSelector:@selector(requestWhenInUseAuthorization)]) {
        [locationManager requestWhenInUseAuthorization];
    }
    [locationManager startUpdatingLocation];
//    [locationManager startMonitoringSignificantLocationChanges];
}

RCT_EXPORT_METHOD(stop) {
    [locationManager stopUpdatingLocation];
}


- (NSArray<NSString *> *)supportedEvents {
    return @[@"significantLocationChange"];
}

// Will be called when this module's first listener is added.
-(void)startObserving {
    hasListeners = YES;
    // Set up any upstream listeners or background tasks as necessary
}

// Will be called when this module's last listener is removed, or on dealloc.
-(void)stopObserving {
    hasListeners = NO;
    // Remove upstream listeners, stop unnecessary background tasks
}

- (void)locationManager:(CLLocationManager *)manager didUpdateLocations:(NSArray *)locations {
    CLLocation* location = [locations lastObject];
    
    lastLocationEvent = @{
                          @"coords": @{
                                  @"latitude": @(location.coordinate.latitude),
                                  @"longitude": @(location.coordinate.longitude),
                                  @"altitude": @(location.altitude),
                                  @"accuracy": @(location.horizontalAccuracy),
                                  @"altitudeAccuracy": @(location.verticalAccuracy),
                                  @"heading": @(location.course),
                                  @"speed": @(location.speed),
                                  },
                          @"timestamp": @([location.timestamp timeIntervalSince1970] * 1000) // in ms
                        };

    RCTLogInfo(@"significantLocationChange : %@", lastLocationEvent);
  [self sendEventWithName:@"significantLocationChange" body:lastLocationEvent];

    
    // TODO: do something meaningful with our location event. We can do that here, or emit back to React Native
    // https://facebook.github.io/react-native/docs/native-modules-ios.html#sending-events-to-javascript
}

@end
