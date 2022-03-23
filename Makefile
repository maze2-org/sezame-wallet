node_version:=$(shell node -v)
npm_version:=$(shell npm -v)
timeStamp:=$(shell date +%Y%m%d%H%M%S)
#version:=$(shell xml2 < config.xml | grep version | cut -d= -f 2)
#versionName:=$(shell xml2 < config.xml | grep version | cut -d= -f 2 | cut -d. -f 1,2)
#versionCode:=$(shell xml2 < config.xml | grep version | cut -d= -f 2 | cut -d. -f 3)
UNAME_S:=$(shell uname -s)

ifeq ($(ANDROID_SDK_ROOT),)
export ANDROID_SDK_ROOT := /opt/android-sdk-linux
endif


ifeq ($(UNAME_S),Darwin)
SEDARG += -i ".bkp"
else
SEDARG += -i
endif

.PHONY: android-version android

node_modules:
	npx yarn

all: android-prod ios-xcode
	mkdir -p platforms/all
	zip -r platforms/all/app-release-all.zip ios android/app/build/outputs/bundle/release/app-release.aab android/app/build/outputs/apk/release/app-release-unsigned.apk

android: node_modules
	mkdir -p ./android/app/src/main/assets/
	npx react-native bundle --dev false --platform android --entry-file index.js --bundle-output ./android/app/src/main/assets/index.android.bundle --assets-dest ./android/app/src/main/res

android-prod: android
#	cd android &&  ./gradlew clean
	cd android && ./gradlew assembleRelease -x bundleReleaseJsAndAssets
	cd android && ./gradlew bundle -x bundleReleaseJsAndAssets
	@ echo Prod APK: ./android/app/build/outputs/apk/release/app-release.apk


android-dev: node_modules android
	cd android && ./gradlew assembleDebug -x bundleReleaseJsAndAssets
	@ echo Debug APK: ./android/app/build/outputs/apk/debug/app-debug.apk

ios: node_modules
	npx react-native run-ios --configuration Release

ios-xcode: ios

sign-android: android-prod
#	jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 -keystore ~/Documents/Iabsis/Passwords/Android.jks android/app/build/outputs/bundle/release/app-release.aab iabsis
#	jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 -keystore ~/Documents/Iabsis/Passwords/Android.jks android/app/build/outputs/apk/release/app-release-unsigned.apk iabsis
	zipalign 4 android/app/build/outputs/apk/release/app-release.apk app-release.apk
	apksigner sign --ks ~/Documents/Iabsis/Passwords/Android.jks android/app/build/outputs/apk/release/app-release.apk
	@echo Bundle app: android/app/build/outputs/bundle/release/app-release.aab
	@echo APK app: android/app/build/outputs/apk/release/app-release-unsigned.apk

show:
	@ echo Timestamp: "$(timeStamp)"
	@ echo Node Version: $(node_version)
	@ echo npm_version: $(npm_version)

clean:
	@ rm -rf node_modules app-release.aab
	@ rm -rf resources/android/icon resources/android/splash resources/ios
	@ rm -rf dist.tar.gz

INFO := @bash -c '\
  printf $(versionCode); \
  echo "=> $$1"; \
