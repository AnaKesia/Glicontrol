# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:
# React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }

# Firebase
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**

# OkHttp, Retrofit, Gson (se usar)
-keep class okhttp3.** { *; }
-dontwarn okhttp3.**
-keep class retrofit2.** { *; }
-dontwarn retrofit2.**
-keep class com.google.gson.** { *; }

# Para Json / Annotations
-keepattributes *Annotation*

# Impede remoção de classes usadas por reflexão
-keep class com.google.firebase.** { *; }
-keep class com.facebook.react.** { *; }
-keep class androidx.** { *; }
-keep class com.google.gson.** { *; }
-keep class com.squareup.okhttp3.** { *; }
-keepattributes *Annotation*

# Evita warnings desnecessários
-dontwarn com.google.firebase.**
-dontwarn com.facebook.react.**
-dontwarn androidx.**
-dontwarn com.squareup.okhttp3.**
# Evita erro R8 por classe faltante JP2Decoder
-dontwarn com.gemalto.jp2.JP2Decoder
-dontwarn com.tom_roush.pdfbox.filter.JPXFilter
