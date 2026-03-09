/**
 * Expo Config Plugin: iOS Widget Extension
 *
 * This plugin performs three things:
 *   1. Adds App Group entitlement to the main app target so that the app
 *      and the widget extension can share data via UserDefaults.
 *   2. Adds the WidgetKit extension target to the Xcode project with all
 *      required build settings, source files, and embed phases.
 *   3. Ensures the custom URL scheme is present in Info.plist.
 *
 * The widget Swift source files are expected to live under targets/widget/
 * relative to the project root.
 */

const {
  withXcodeProject,
  withEntitlementsPlist,
  withInfoPlist,
  withDangerousMod,
  withPlugins,
} = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const APP_GROUP = 'group.com.trace.gunluk';
const WIDGET_BUNDLE_ID = 'com.trace.gunluk.widget';
const WIDGET_NAME = 'TraceWidget';
const WIDGET_DIR = 'targets/widget'; // relative to project root
const DEPLOYMENT_TARGET = '17.0';

// ---------------------------------------------------------------------------
// 1. App Group Entitlements (main app)
// ---------------------------------------------------------------------------

/**
 * Adds the App Group entitlement to the main application target so that the
 * app can read/write to a shared UserDefaults suite.
 */
function withAppGroupEntitlement(config) {
  return withEntitlementsPlist(config, (mod) => {
    const entitlements = mod.modResults;

    // Ensure the application-groups array exists
    if (!entitlements['com.apple.security.application-groups']) {
      entitlements['com.apple.security.application-groups'] = [];
    }

    const groups = entitlements['com.apple.security.application-groups'];

    if (!groups.includes(APP_GROUP)) {
      groups.push(APP_GROUP);
    }

    return mod;
  });
}

// ---------------------------------------------------------------------------
// 2. Info.plist – URL Scheme
// ---------------------------------------------------------------------------

/**
 * Ensures the "gunluk" URL scheme is registered in CFBundleURLTypes so that
 * deep-linking works correctly.
 */
function withURLScheme(config) {
  return withInfoPlist(config, (mod) => {
    const infoPlist = mod.modResults;

    if (!infoPlist.CFBundleURLTypes) {
      infoPlist.CFBundleURLTypes = [];
    }

    const hasScheme = infoPlist.CFBundleURLTypes.some((entry) => {
      return (
        entry.CFBundleURLSchemes &&
        entry.CFBundleURLSchemes.includes('gunluk')
      );
    });

    if (!hasScheme) {
      infoPlist.CFBundleURLTypes.push({
        CFBundleURLSchemes: ['gunluk'],
      });
    }

    return mod;
  });
}

// ---------------------------------------------------------------------------
// 3. Podfile – Firebase Modular Headers Fix
// ---------------------------------------------------------------------------

/**
 * Firebase Swift pods require certain dependencies to have modular headers
 * enabled. Since prebuild regenerates the Podfile, we patch it here.
 */
function withFirebaseModularHeaders(config) {
  return withDangerousMod(config, [
    'ios',
    async (mod) => {
      const podfilePath = path.join(mod.modRequest.platformProjectRoot, 'Podfile');
      if (!fs.existsSync(podfilePath)) return mod;

      let podfile = fs.readFileSync(podfilePath, 'utf8');

      // Only add if not already present
      if (!podfile.includes('FirebaseAuthInterop')) {
        const modularHeaders = `
  # Firebase Swift pods require modular headers
  pod 'FirebaseAuth', :modular_headers => true
  pod 'FirebaseAuthInterop', :modular_headers => true
  pod 'FirebaseAppCheckInterop', :modular_headers => true
  pod 'FirebaseCore', :modular_headers => true
  pod 'FirebaseCoreInternal', :modular_headers => true
  pod 'FirebaseCoreExtension', :modular_headers => true
  pod 'FirebaseFirestore', :modular_headers => true
  pod 'FirebaseFirestoreInternal', :modular_headers => true
  pod 'FirebaseSharedSwift', :modular_headers => true
  pod 'GoogleUtilities', :modular_headers => true
  pod 'RecaptchaInterop', :modular_headers => true
`;
        // Insert after use_expo_modules!
        podfile = podfile.replace(
          'use_expo_modules!',
          `use_expo_modules!\n${modularHeaders}`,
        );

        fs.writeFileSync(podfilePath, podfile, 'utf8');
        console.log('[withWidget] Added Firebase modular headers to Podfile.');
      }

      return mod;
    },
  ]);
}

// ---------------------------------------------------------------------------
// 4. Xcode Project – Widget Extension Target
// ---------------------------------------------------------------------------

/**
 * The heavy lifter: creates a PBXNativeTarget for the widget extension,
 * wires up source / resource files, build settings, and the embed phase.
 */
function withWidgetTarget(config) {
  return withXcodeProject(config, async (mod) => {
    const xcodeProject = mod.modResults;
    const projectRoot = mod.modRequest.projectRoot;
    const iosDir = path.join(projectRoot, 'ios');

    // -- Resolve widget source directory ----------------------------------

    const widgetSrcDir = path.join(projectRoot, WIDGET_DIR);

    if (!fs.existsSync(widgetSrcDir)) {
      console.warn(
        `[withWidget] Widget source directory not found at ${widgetSrcDir}. ` +
          'Skipping widget target creation. Create the directory and re-run prebuild.',
      );
      return mod;
    }

    // -- Gather source & resource files -----------------------------------

    const allFiles = fs.readdirSync(widgetSrcDir);
    const swiftFiles = allFiles.filter((f) => f.endsWith('.swift'));
    const hasAssets = allFiles.includes('Assets.xcassets');
    const hasInfoPlist = allFiles.includes('Info.plist');
    const hasEntitlements = allFiles.includes(`${WIDGET_NAME}.entitlements`);

    if (swiftFiles.length === 0) {
      console.warn(
        `[withWidget] No Swift files found in ${widgetSrcDir}. Skipping widget target.`,
      );
      return mod;
    }

    // -- Copy widget files into the ios/ build directory -------------------
    // Expo's prebuild regenerates the ios/ folder, so we must copy every
    // time to make sure the files are present.

    const widgetBuildDir = path.join(iosDir, WIDGET_NAME);
    if (!fs.existsSync(widgetBuildDir)) {
      fs.mkdirSync(widgetBuildDir, { recursive: true });
    }

    // Copy all files from the widget source into the build dir
    copyDirRecursive(widgetSrcDir, widgetBuildDir);

    // -- Check if the target already exists (idempotency) -----------------

    const existingTarget = xcodeProject.pbxTargetByName(WIDGET_NAME);
    if (existingTarget) {
      console.log(`[withWidget] Target "${WIDGET_NAME}" already exists. Skipping.`);
      return mod;
    }

    // -- Create the widget extension target --------------------------------

    const targetResult = xcodeProject.addTarget(
      WIDGET_NAME,
      'app_extension',
      WIDGET_NAME,
      WIDGET_BUNDLE_ID,
    );

    const widgetTarget = targetResult.target;
    const widgetTargetUuid = targetResult.uuid;

    // -- Add a PBXGroup for the widget's files ----------------------------

    const widgetGroupKey = xcodeProject.pbxCreateGroup(WIDGET_NAME, WIDGET_NAME);

    // Add Swift source files using addBuildPhase (avoids xcode lib bugs with groups)
    const sourceFiles = swiftFiles.map((f) => `${WIDGET_NAME}/${f}`);
    xcodeProject.addBuildPhase(
      sourceFiles,
      'PBXSourcesBuildPhase',
      'Sources',
      widgetTargetUuid,
      'app_extension',
    );

    // Add Assets.xcassets using addBuildPhase for resources
    if (hasAssets) {
      xcodeProject.addBuildPhase(
        [`${WIDGET_NAME}/Assets.xcassets`],
        'PBXResourcesBuildPhase',
        'Resources',
        widgetTargetUuid,
        'app_extension',
      );
    }

    // Add file references to a PBXGroup for project navigator
    const pbxGroupSection = xcodeProject.hash.project.objects['PBXGroup'];
    if (pbxGroupSection[widgetGroupKey]) {
      const children = [];
      for (const swiftFile of swiftFiles) {
        const fileRefUuid = xcodeProject.generateUuid();
        xcodeProject.addToPbxFileReferenceSection({
          uuid: fileRefUuid,
          fileRef: fileRefUuid,
          path: swiftFile,
          basename: swiftFile,
          sourceTree: '"<group>"',
          lastKnownFileType: 'sourcecode.swift',
          group: WIDGET_NAME,
        });
        children.push({ value: fileRefUuid, comment: swiftFile });
      }
      if (hasAssets) {
        const assetsRefUuid = xcodeProject.generateUuid();
        xcodeProject.addToPbxFileReferenceSection({
          uuid: assetsRefUuid,
          fileRef: assetsRefUuid,
          path: 'Assets.xcassets',
          basename: 'Assets.xcassets',
          sourceTree: '"<group>"',
          lastKnownFileType: 'folder.assetcatalog',
          group: WIDGET_NAME,
        });
        children.push({ value: assetsRefUuid, comment: 'Assets.xcassets' });
      }
      if (hasInfoPlist) {
        const plistRefUuid = xcodeProject.generateUuid();
        xcodeProject.addToPbxFileReferenceSection({
          uuid: plistRefUuid,
          fileRef: plistRefUuid,
          path: 'Info.plist',
          basename: 'Info.plist',
          sourceTree: '"<group>"',
          lastKnownFileType: 'text.plist.xml',
          group: WIDGET_NAME,
        });
        children.push({ value: plistRefUuid, comment: 'Info.plist' });
      }
      if (hasEntitlements) {
        const entRefUuid = xcodeProject.generateUuid();
        xcodeProject.addToPbxFileReferenceSection({
          uuid: entRefUuid,
          fileRef: entRefUuid,
          path: `${WIDGET_NAME}.entitlements`,
          basename: `${WIDGET_NAME}.entitlements`,
          sourceTree: '"<group>"',
          lastKnownFileType: 'text.plist.entitlements',
          group: WIDGET_NAME,
        });
        children.push({ value: entRefUuid, comment: `${WIDGET_NAME}.entitlements` });
      }
      pbxGroupSection[widgetGroupKey].children = children;
    }

    // Place the widget group inside the project's main group
    const mainGroupId = xcodeProject.getFirstProject().firstProject.mainGroup;
    if (pbxGroupSection[mainGroupId]) {
      pbxGroupSection[mainGroupId].children.push({
        value: widgetGroupKey,
        comment: WIDGET_NAME,
      });
    }

    // -- Build Settings ---------------------------------------------------

    const buildConfigs = xcodeProject.pbxXCBuildConfigurationSection();
    const targetBuildConfigs = [];

    // Identify build configurations that belong to our widget target
    for (const key in buildConfigs) {
      // Skip comment keys
      if (key.endsWith('_comment')) continue;

      const cfg = buildConfigs[key];
      if (
        cfg.buildSettings &&
        cfg.buildSettings.PRODUCT_NAME === `"${WIDGET_NAME}"`
      ) {
        targetBuildConfigs.push(key);
      }
    }

    const entitlementsPath = hasEntitlements
      ? `${WIDGET_NAME}/${WIDGET_NAME}.entitlements`
      : undefined;

    const commonBuildSettings = {
      SWIFT_VERSION: '5.0',
      TARGETED_DEVICE_FAMILY: '"1,2"',
      IPHONEOS_DEPLOYMENT_TARGET: DEPLOYMENT_TARGET,
      CODE_SIGN_ENTITLEMENTS: entitlementsPath ? `"${entitlementsPath}"` : undefined,
      PRODUCT_NAME: `"${WIDGET_NAME}"`,
      PRODUCT_BUNDLE_IDENTIFIER: `"${WIDGET_BUNDLE_ID}"`,
      INFOPLIST_FILE: `"${WIDGET_NAME}/Info.plist"`,
      ASSETCATALOG_COMPILER_WIDGET_BACKGROUND_COLOR_NAME: '"WidgetBackground"',
      ASSETCATALOG_COMPILER_GLOBAL_ACCENT_COLOR_NAME: '"AccentColor"',
      LD_RUNPATH_SEARCH_PATHS:
        '"$(inherited) @executable_path/Frameworks @executable_path/../../Frameworks"',
      SKIP_INSTALL: 'YES',
      SWIFT_EMIT_LOC_STRINGS: 'YES',
      GENERATE_INFOPLIST_FILE: 'NO',
      // Ensure the extension runs on the same signing team as the main app
      CODE_SIGN_STYLE: 'Automatic',
      CURRENT_PROJECT_VERSION: '1',
      MARKETING_VERSION: '1.0',
    };

    for (const key of targetBuildConfigs) {
      const cfg = buildConfigs[key];
      Object.assign(cfg.buildSettings, commonBuildSettings);
    }

    // If we could not find configs by product name (some xcode versions
    // initialise differently), fall back to iterating the target's
    // buildConfigurationList.
    if (targetBuildConfigs.length === 0) {
      try {
        const configListId = widgetTarget.buildConfigurationList;
        const configList =
          xcodeProject.pbxXCConfigurationList()[configListId] ||
          xcodeProject.pbxXCConfigurationList()[`${configListId}_comment`];
        if (configList && configList.buildConfigurations) {
          for (const ref of configList.buildConfigurations) {
            const cfgId = ref.value;
            if (buildConfigs[cfgId] && buildConfigs[cfgId].buildSettings) {
              Object.assign(
                buildConfigs[cfgId].buildSettings,
                commonBuildSettings,
              );
            }
          }
        }
      } catch (e) {
        console.warn(
          '[withWidget] Could not apply build settings via configList fallback:',
          e.message,
        );
      }
    }

    // -- Add target dependency so the extension builds with the app -------

    const mainTargetUuid = xcodeProject.getFirstTarget().uuid;
    xcodeProject.addTargetDependency(mainTargetUuid, [widgetTargetUuid]);

    // -- Embed the extension via a manual CopyFiles build phase -----------
    // We create the embed phase without referencing .appex directly to
    // avoid xcodeproj consistency errors with orphan file references.

    const embedPhaseUuid = xcodeProject.generateUuid();
    const buildPhaseSection = xcodeProject.hash.project.objects['PBXCopyFilesBuildPhase'];
    if (buildPhaseSection) {
      buildPhaseSection[embedPhaseUuid] = {
        isa: 'PBXCopyFilesBuildPhase',
        buildActionMask: 2147483647,
        dstPath: '""',
        dstSubfolderSpec: 13, // PlugIns & App Extensions
        files: [],
        name: '"Embed App Extensions"',
        runOnlyForDeploymentPostprocessing: 0,
      };
      buildPhaseSection[`${embedPhaseUuid}_comment`] = 'Embed App Extensions';

      // Add this phase to the main target's buildPhases array
      const nativeTargets = xcodeProject.hash.project.objects['PBXNativeTarget'];
      for (const key in nativeTargets) {
        if (key.endsWith('_comment')) continue;
        if (nativeTargets[key].productName === 'Trace' || nativeTargets[key].name === 'Trace') {
          nativeTargets[key].buildPhases.push({
            value: embedPhaseUuid,
            comment: 'Embed App Extensions',
          });
          break;
        }
      }
    }

    console.log(`[withWidget] Widget extension target "${WIDGET_NAME}" added successfully.`);

    return mod;
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Recursively copies all files from src to dest, creating directories as
 * needed. Existing files are overwritten.
 */
function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// ---------------------------------------------------------------------------
// Plugin Entry Point
// ---------------------------------------------------------------------------

/**
 * Main plugin – composes the three sub-plugins.
 */
const withWidget = (config) => {
  // Apply sub-plugins in order
  config = withAppGroupEntitlement(config);
  config = withURLScheme(config);
  config = withFirebaseModularHeaders(config);
  config = withWidgetTarget(config);
  return config;
};

module.exports = withWidget;
