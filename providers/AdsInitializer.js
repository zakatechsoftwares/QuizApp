// File: providers/AdsInitializer.js
import React, { useEffect } from "react";
import { Platform } from "react-native";
import {
  InterstitialAd,
  TestIds,
  AdEventType,
} from "react-native-google-mobile-ads";
import { useSelector } from "react-redux";

const adUnitId = __DEV__
  ? TestIds.INTERSTITIAL
  : Platform.OS === "ios"
  ? "ca-app-pub-1200533271102374/2014340817"
  : "ca-app-pub-1200533271102374/3189737409";

const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
  requestNonPersonalizedAdsOnly: true,
  keywords: ["education", "quiz", "examinations"],
});

export default function AdsInitializer({ children }) {
  const showAdvert = useSelector((s) => s.user.showAdvert);

  useEffect(() => {
    const unsubscribe = interstitial.addAdEventListener(
      AdEventType.LOADED,
      () => {
        if (showAdvert) {
          interstitial.show();
        }
      }
    );

    interstitial.load();

    return () => {
      unsubscribe();
    };
  }, [showAdvert]);

  return <>{children}</>;
}
