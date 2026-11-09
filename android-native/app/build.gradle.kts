plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.plugin.compose")
}

android {
    namespace = "live.restora.nativeapp"
    compileSdk = 37

    defaultConfig {
        // Existing Google Play / production Android application ID.
        // WARNING: installing this unfinished native preview can replace the React Native app.
        // Keep the Kotlin source namespace distinct until an intentional source migration.
        applicationId = "com.restoralive.app"
        minSdk = 26
        targetSdk = 36
        versionCode = 1
        versionName = "0.1.0"
        buildConfigField("String", "API_BASE_URL", "\"https://restora.live/api/v1\"")
        buildConfigField("String", "WEB_APP_URL", "\"https://app.restora.live\"")
        buildConfigField("String", "PUBLIC_QR_BASE_URL", "\"https://restora.live\"")
        buildConfigField("String", "GOOGLE_WEB_CLIENT_ID", "\"415170912813-7ikcdht16n2vgumkkpvaslda5c8kbbop.apps.googleusercontent.com\"")
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    lint {
        abortOnError = true
        warningsAsErrors = true
    }
}

kotlin {
    compilerOptions {
        allWarningsAsErrors.set(true)
    }
}

dependencies {
    val composeBom = platform("androidx.compose:compose-bom:2026.09.00")
    implementation(composeBom)
    implementation("androidx.activity:activity-compose:1.13.0")
    // Stable AndroidX Credential Manager + Google's latest stable ID-token SDK.
    implementation("androidx.credentials:credentials:1.6.0")
    implementation("androidx.credentials:credentials-play-services-auth:1.6.0")
    implementation("com.google.android.libraries.identity.googleid:googleid:1.2.1")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.11.0")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.11.0")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.11.0")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.foundation:foundation")
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-tooling-preview")
    debugImplementation("androidx.compose.ui:ui-tooling")
    testImplementation("junit:junit:4.13.2")
}
