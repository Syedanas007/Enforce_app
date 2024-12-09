//
//  LocationFetch.swift
//  ExperionActivityTracker
//
//  Created by Arjun on 31/01/20.
//  Copyright © 2020 Facebook. All rights reserved.
//

import Foundation
import CoreLocation
@objc(LocationFetch)
class LocationFetch: RCTEventEmitter, CLLocationManagerDelegate {
  static let sharedInstance = LocationFetch()
  private var location = CLLocation()
  private override init() {
    super.init()
  }
  var log = TextLog()
  private lazy var locationManager: CLLocationManager = {
    let manager = CLLocationManager()
    manager.desiredAccuracy = kCLLocationAccuracyBest
    manager.delegate = self
    manager.requestWhenInUseAuthorization()
    manager.allowsBackgroundLocationUpdates = true
    return manager
  }()
  
  @objc
  func startUpdatingLocation() {
    print("Start Updating Locations")
    print("Location Manager: ", locationManager)
    DispatchQueue.main.async {
      let locationManager = CLLocationManager()
      locationManager.desiredAccuracy = kCLLocationAccuracyBest
      locationManager.delegate = self
      locationManager.requestWhenInUseAuthorization()
      locationManager.allowsBackgroundLocationUpdates = true
      locationManager.startUpdatingLocation()
    }
  }
  
  func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
    print("Locations fetched")
    location = locations.last! as CLLocation
    print("Latitude:", location.coordinate.latitude)
    print("Latitude:", location.coordinate.longitude)
    var latitude = location.coordinate.latitude
    var longitude = location.coordinate.longitude
    let time = getCurrentDateTime()
    log.write("Lat: \(latitude) Long: \(longitude) Time: \(time) \n")
    sendEvent(withName: "onLocation", body: ["location": location])
  }
  
  @objc
  func stopUpdatingLocation() {
    locationManager.stopUpdatingLocation()
  }
   // we need to override this method and
  // return an array of event names that we can listen to
  override func supportedEvents() -> [String]! {
    return ["onLocation"]
  }
  
  override func constantsToExport() -> [AnyHashable : Any]! {
    return ["location": location]
  }
  
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  func getCurrentDateTime() -> String {
    let dateFormatter : DateFormatter = DateFormatter()
    //  dateFormatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
    dateFormatter.dateFormat = "yyyy-MMM-dd HH:mm:ss"
    let date = Date()
    let dateString = dateFormatter.string(from: date)
    return dateString
  }
}

struct TextLog: TextOutputStream {
  
  /// Appends the given string to the stream.
  mutating func write(_ string: String) {
    let paths = FileManager.default.urls(for: .documentDirectory, in: .allDomainsMask)
    print(paths)
    let documentDirectoryPath = paths.first!
    let log = documentDirectoryPath.appendingPathComponent("logFile.txt")
    
    do {
      let handle = try FileHandle(forWritingTo: log)
      handle.seekToEndOfFile()
      handle.write(string.data(using: .utf8)!)
      handle.closeFile()
    } catch {
      print(error.localizedDescription)
      do {
        try string.data(using: .utf8)?.write(to: log)
      } catch {
        print(error.localizedDescription)
      }
    }
    
  }
  
}
