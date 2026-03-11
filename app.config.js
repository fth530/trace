module.exports = {
    name: "Trace",
    slug: "gunluk-trace",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "automatic",
    icon: "./assets/icon.png",
    splash: {
        image: "./assets/splash.png",
        resizeMode: "contain",
        backgroundColor: "#0A0A0A"
    },
    assetBundlePatterns: ["**/*"],
    ios: {
        supportsTablet: true,
        bundleIdentifier: "com.trace.gunluk",
        icon: "./assets/icon.png",
        privacyManifests: {
            NSPrivacyAccessedAPITypes: [
                {
                    NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategoryUserDefaults",
                    NSPrivacyAccessedAPITypeReasons: ["CA92.1"]
                }
            ],
            NSPrivacyTracking: false
        },
        infoPlist: {
            CFBundleAllowMixedLocalizations: true
        }
    },
    android: {
        adaptiveIcon: {
            foregroundImage: "./assets/adaptive-icon.png",
            backgroundColor: "#0A0A0A"
        },
        package: "com.trace.gunluk"
    },
    plugins: [
        "expo-router",
        "expo-sqlite",
        "expo-localization",
        "./plugins/withWidget",
        [
            "@sentry/react-native/expo",
            {
                url: "https://sentry.io/",
                project: process.env.EXPO_PUBLIC_SENTRY_PROJECT_ID || "TRACE_DEBUG",
                organization: process.env.EXPO_PUBLIC_SENTRY_ORG || "TRACE_DEBUG"
            }
        ]
    ],
    scheme: "gunluk",
    extra: {
        eas: {
            projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID || "TRACE_DEBUG"
        }
    }
};
