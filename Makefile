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

.PHONY: android-version

node_modules:
	npx yarn

all: android-prod ios-xcode
	mkdir -p platforms/all
	zip -r platforms/all/app-release-all.zip ios android/app/build/outputs/bundle/release/app-release.aab android/app/build/outputs/apk/release/app-release-unsigned.apk

build:
#	npx react-native upgrade

android: node_modules build
	mkdir -p ./android/app/src/main/assets/
	npx react-native bundle --dev false --platform android --entry-file index.js --bundle-output ./android/app/src/main/assets/index.android.bundle --assets-dest ./android/app/src/main/res

android-prod: android
	cd android && ./gradlew assembleRelease
	cd android && ./gradlew bundle
	@ echo Debug APK: ./android/app/build/outputs/apk/debug/app-debug.apk


android-dev: node_modules build android
	cd android && ./gradlew assembleDebug
	@ echo Debug APK: ./android/app/build/outputs/apk/debug/app-debug.apk

ios: node_modules build
	npx react-native run-ios --configuration Release

ios-xcode: ios

sign-android: android-prod
	jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 -keystore ~/Documents/Iabsis/Passwords/Android.jks android/app/build/outputs/bundle/release/app-release.aab iabsis
	jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 -keystore ~/Documents/Iabsis/Passwords/Android.jks android/app/build/outputs/apk/release/app-release-unsigned.apk iabsis
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
