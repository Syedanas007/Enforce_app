package com.enforcesolutions;

import static com.enforcesolutions.ForegroundService.reactContext;
import static com.enforcesolutions.MainActivity.REQUEST_CODE_GPS_RESOLUTION_REQUIRED;
import static com.enforcesolutions.MainActivity.sampleContext;

import android.content.Context;
import android.content.Intent;
import android.content.IntentSender;
import android.os.Build;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.android.gms.common.api.ResolvableApiException;
import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.location.LocationSettingsRequest;
import com.google.android.gms.location.LocationSettingsResponse;
import com.google.android.gms.location.LocationSettingsStatusCodes;
import com.google.android.gms.location.SettingsClient;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.android.gms.tasks.Task;

public class MyDataLocationManager extends ReactContextBaseJavaModule {

    private LocationRequest locationRequest;
    private FusedLocationProviderClient fusedLocationClient;
    private LocationCallback locationCallback;
    public Context context;
    public static MyDataLocationManager myDataLocationManager;

    public MyDataLocationManager(@NonNull ReactApplicationContext context) {
        super(context);


    }

    public static MyDataLocationManager getInstance() {
        if (myDataLocationManager == null) {
            myDataLocationManager = new MyDataLocationManager(reactContext);
        }
        return myDataLocationManager;
    }

    public void sendEvent(ReactContext reactContext,
                          String eventName,
                          @Nullable WritableMap params) {
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

    @ReactMethod
    public void startLocationUpdates() {
        System.out.println("Started function location");
        enableGpsLocation();
    }

    @ReactMethod
    public void stopLocationUpdates() {
        Intent myService = new Intent(reactContext, ForegroundService.class);
        reactContext.stopService(myService);
    }

    @ReactMethod
    public void enableGpsLocation() {
        try {
            LocationRequest locationRequest = new LocationRequest();
            //  locationRequest.setInterval(5000);
            //  locationRequest.setFastestInterval(5000);
            locationRequest.setPriority(LocationRequest.PRIORITY_HIGH_ACCURACY);
            LocationSettingsRequest.Builder builder =
                    new LocationSettingsRequest.Builder().addLocationRequest(locationRequest);
            SettingsClient client = LocationServices.getSettingsClient(sampleContext);
            Task<LocationSettingsResponse> task = client.checkLocationSettings(builder.build());

            task.addOnFailureListener((MainActivity) sampleContext, new OnFailureListener() {
                @Override
                public void onFailure(@NonNull Exception e) {
                    if (e instanceof ResolvableApiException) {
                        try {
                            if (((ResolvableApiException) e).getStatusCode() == LocationSettingsStatusCodes.RESOLUTION_REQUIRED) {
                                try {
                                    // Cast to a resolvable exception.
                                    ResolvableApiException resolvable = ((ResolvableApiException) e);
                                    // Show the dialog by calling startResolutionForResult(),
                                    // and check the result in onActivityResult().
                                    resolvable.startResolutionForResult(
                                            (MainActivity) sampleContext,
                                            REQUEST_CODE_GPS_RESOLUTION_REQUIRED
                                    );
                                } catch (IntentSender.SendIntentException ex) {
                                    // Ignore the error.
                                } catch (ClassCastException classException) {
                                    // Ignore, should be an impossible error.
                                }
                            }

                        } catch (Exception exception) {

                        }
                    }
                }
            });
            task.addOnSuccessListener((MainActivity) sampleContext, new OnSuccessListener<LocationSettingsResponse>() {
                @Override
                public void onSuccess(LocationSettingsResponse locationSettingsResponse) {
                    Intent serviceIntent = new Intent(reactContext, ForegroundService.class);
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        reactContext.startForegroundService(serviceIntent);
                    } else {
                        reactContext.startService(serviceIntent);
                    }
                }
            });

        } catch (Exception exc) {
            exc.printStackTrace();
        }
    }


    @Override
    public String getName() {
        return "significantLocationChange";
    }

//    @ReactMethod
//    public void createLocationRequest() {
//        locationRequest = new LocationRequest();
//        locationRequest.setInterval(5000);
//        locationRequest.setFastestInterval(5000);
//        locationRequest.setPriority(LocationRequest.PRIORITY_HIGH_ACCURACY);
//
//
//        fusedLocationClient.requestLocationUpdates(locationRequest,
//                locationCallback,
//                Looper.getMainLooper());
//    }
}