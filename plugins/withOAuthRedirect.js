const { withAndroidManifest } = require("@expo/config-plugins");

const withOAuthRedirect = (config) => {
  return withAndroidManifest(config, (config) => {
    const mainActivity = config.modResults.manifest.application?.[0]?.activity?.find(
      (activity) => activity.$["android:name"] === ".MainActivity"
    );

    if (mainActivity) {
      mainActivity["intent-filter"] = mainActivity["intent-filter"] || [];
      mainActivity["intent-filter"].push({
        action: [
          {
            $: {
              "android:name": "android.intent.action.VIEW",
            },
          },
        ],
        category: [
          {
            $: {
              "android:name": "android.intent.category.DEFAULT",
            },
          },
          {
            $: {
              "android:name": "android.intent.category.BROWSABLE",
            },
          },
        ],
        data: [
          {
            $: {
              "android:scheme": "ru.beeline.location",
              "android:path": "/callback",
            },
          },
        ],
      });
    }

    return config;
  });
};

module.exports = withOAuthRedirect;
