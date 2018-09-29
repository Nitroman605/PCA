package com.sensebook;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.RNProximity.RNProximityPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.sensors.RNSensorsPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.babisoft.ReactNativeLocalization.ReactNativeLocalizationPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.polidea.reactnativeble.BlePackage;
import com.agontuk.RNFusedLocation.RNFusedLocationPackage;
import com.devstepbcn.wifi.AndroidWifiPackage;
import com.ocetnik.timer.BackgroundTimerPackage;
import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new RNProximityPackage(),
            new RNDeviceInfo(),
            new RNSensorsPackage(),
            new VectorIconsPackage(),
            new ReactNativeLocalizationPackage(),
            new BlePackage(),
            new RNFusedLocationPackage(),
            new AndroidWifiPackage(),
            new BackgroundTimerPackage()
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
  }
}
