//
//  MyLocationDataManager.h
//  ExperionActivityTracker
//
//  Created by Arjun on 04/02/20.
//  Copyright © 2020 Facebook. All rights reserved.
//
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <CoreLocation/CLLocationManager.h>
#import <CoreLocation/CLLocationManagerDelegate.h>
@interface MyLocationDataManager :RCTEventEmitter <RCTBridgeModule,CLLocationManagerDelegate>
@end
