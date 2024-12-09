package com.enforcesolutions;

import android.app.Application;
import android.content.Context;

import com.agontuk.RNFusedLocation.RNFusedLocationPackage;
import com.facebook.react.ReactApplication;
import com.agontuk.RNFusedLocation.RNFusedLocationPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.horcrux.svg.SvgPackage;
import com.agontuk.RNFusedLocation.RNFusedLocationPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.horcrux.svg.SvgPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;


import java.lang.reflect.InvocationTargetException;
import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

    private final ReactNativeHost mReactNativeHost =
        new ReactNativeHost(this) {
          @Override
          public boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
          }

          @Override
          protected List<ReactPackage> getPackages() {
            return Arrays.<ReactPackage>asList(
                new MainReactPackage(),
            new RNFusedLocationPackage(),
            new VectorIconsPackage(),
            new SvgPackage(),
            new RNFusedLocationPackage(),
            new VectorIconsPackage(),
            new SvgPackage(),
                new RNFusedLocationPackage() // Correct Geolocation package
            );
          }

          @Override
          protected String getJSMainModuleName() {
            return "index";
          }
        };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
    initializeFlipper(this); // Remove if Flipper is not needed
  }

  private static void initializeFlipper(Context context) {
    if (BuildConfig.DEBUG) {
      try {
        Class<?> aClass = Class.forName("com.facebook.flipper.ReactNativeFlipper");
        aClass.getMethod("initializeFlipper", Context.class).invoke(null, context);
      } catch (ClassNotFoundException | NoSuchMethodException | IllegalAccessException | InvocationTargetException e) {
        e.printStackTrace();
      }
    }
  }
}
