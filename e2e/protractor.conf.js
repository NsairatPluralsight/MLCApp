// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const { SpecReporter } = require('jasmine-spec-reporter');

process.env.HEADLESS = process.env.HEADLESS || require("puppeteer").executablePath();

exports.config = {
  allScriptsTimeout: 11000,
  specs: [
    './src/**/*.e2e-spec.ts'
  ],
  capabilities: {
    'browserName': 'chrome',
    chromeOptions: {
      args: process.env.HEADLESS
        ? ['--headless', '--no-sandbox', '--disable-dev-shm-usage']
        : [],
      binary: process.env.HEADLESS ? require("puppeteer").executablePath() : undefined,
    },
  },
  directConnect: true,
  baseUrl: 'http://localhost:4200/',
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
    print: function () { }
  },
  onPrepare() {
    require('ts-node').register({
      project: require('path').join(__dirname, './tsconfig.e2e.json')
    });
    jasmine.getEnv().addReporter(new SpecReporter({ spec: { displayStacktrace: true } }));
  },
  plugins: [
    {
      package: "protractor-console-plugin",
      failOnWarning: false,
      failOnError: true,
      logWarnings: true,
      exclude: ['Failed to load resource', 'HttpErrorResponse']
    }
  ]
};
