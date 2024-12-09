package com.enforcesolutions;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.location.Location;
import android.os.Build;
import android.os.IBinder;
import android.os.Looper;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationCompat;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.tasks.OnSuccessListener;

public class ForegroundService extends Service {
    private LocationRequest locationRequest;
    private FusedLocationProviderClient fusedLocationClient;
    private LocationCallback locationCallback;
    private Context context;
    public static ReactApplicationContext reactContext;

    @Override
    public void onCreate() {
        super.onCreate();
        context = this;
        createNotificationChannel();
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                this,
                0, notificationIntent, 0
        );
        Notification notification = new NotificationCompat.Builder(this, "LocationServiceChannelId")
                .setContentTitle("Location service running")
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentIntent(pendingIntent)
                .build();

        startForeground(2020, notification);
        initValues();
        System.out.println("Foreground init");
        Log.e("LOcation", "Foreground");
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel serviceChannel = new NotificationChannel(
                    "LocationServiceChannelId",
                    "LocationServiceChannelName",
                    NotificationManager.IMPORTANCE_LOW
            );
            serviceChannel.enableVibration(false);

            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(serviceChannel);
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        return START_NOT_STICKY;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        stopForeground(true);
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    public void initValues() {
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(MainActivity.sampleContext);

        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED && ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            // TODO: Consider calling
            //    ActivityCompat#requestPermissions
            // here to request the missing permissions, and then overriding
            //   public void onRequestPermissionsResult(int requestCode, String[] permissions,
            //                                          int[] grantResults)
            // to handle the case where the user grants the permission. See the documentation
            // for ActivityCompat#requestPermissions for more details.
            return;
        }
        fusedLocationClient.getLastLocation().addOnSuccessListener(
                new OnSuccessListener<Location>() {
                    @Override
                    public void onSuccess(Location location) {
                        if (location != null) {
//                val latLng = LatLng(location.latitude, location.longitude)

                        }
                    }
                }

        );

        if (locationRequest == null && locationCallback == null) {


            locationCallback = new LocationCallback() {
                @Override
                public void onLocationResult(LocationResult locationResult) {
                    if (locationResult == null) {
                        return;
                    }
                    Location lastLocation = locationResult.getLastLocation();
                    if (lastLocation != null && lastLocation.hasAccuracy() && lastLocation.getAccuracy() < 70) {
                        WritableMap params = Arguments.createMap();
                        params.putDouble("latitude", lastLocation.getLatitude());
                        params.putDouble("longitude", lastLocation.getLongitude());
                        params.putDouble("accuracy", lastLocation.getAccuracy());
                        params.putDouble("speed", lastLocation.getSpeed());
                        params.putDouble("timeStamp", lastLocation.getTime());
                        params.putBoolean("isMockedLocation", lastLocation.isFromMockProvider());
                        Log.e("Mock: " , ""+lastLocation.isFromMockProvider());
                        MyDataLocationManager.getInstance().sendEvent(ForegroundService.reactContext, "significantLocationChange", params);
                    }
                }
            };
            createLocationRequest();
        }
    }

    public void stopLocationUpdates() {
        fusedLocationClient.removeLocationUpdates(locationCallback);
    }

    public void createLocationRequest() {
        locationRequest = new LocationRequest();
        locationRequest.setInterval(5000);
        locationRequest.setFastestInterval(5000);
        locationRequest.setPriority(LocationRequest.PRIORITY_HIGH_ACCURACY);


        fusedLocationClient.requestLocationUpdates(locationRequest,
                locationCallback,
                Looper.getMainLooper());
    }
}