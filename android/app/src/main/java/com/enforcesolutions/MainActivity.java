package com.enforcesolutions;

import static com.enforcesolutions.ForegroundService.reactContext;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;

import com.enforcesolutions.ForegroundService;
import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView;

public class MainActivity extends ReactActivity {

    public static final int REQUEST_CODE_GPS_RESOLUTION_REQUIRED = 999;
    @SuppressLint("StaticFieldLeak")
    public static Context sampleContext;
 

    /**
     * Returns the name of the main component registered from JavaScript. This is used to schedule
     * rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "EnForce";
    }

    @Override
    protected ReactActivityDelegate createReactActivityDelegate() {
        return new ReactActivityDelegate(this, getMainComponentName()) {
            @Override
            protected ReactRootView createRootView() {
                return new RNGestureHandlerEnabledRootView(MainActivity.this);
            }
        };
    }
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        sampleContext = this;
        super.onCreate(savedInstanceState);
    }
     public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if( requestCode == REQUEST_CODE_GPS_RESOLUTION_REQUIRED && resultCode == Activity.RESULT_OK) {
            Intent serviceIntent = new Intent(reactContext, ForegroundService.class);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                reactContext.startForegroundService(serviceIntent);
            } else {
                reactContext.startService(serviceIntent);
            }
        }
    }
}
