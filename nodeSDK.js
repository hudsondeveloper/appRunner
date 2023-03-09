const process = require("process");
const opentelemetry = require("@opentelemetry/sdk-node");
const { Resource, detectResources } = require("@opentelemetry/resources");

const {
  SemanticResourceAttributes,
} = require("@opentelemetry/semantic-conventions");
const { BatchSpanProcessor } = require("@opentelemetry/sdk-trace-base");
const {
  OTLPTraceExporter,
} = require("@opentelemetry/exporter-trace-otlp-grpc");
const { AWSXRayPropagator } = require("@opentelemetry/propagator-aws-xray");
const { AWSXRayIdGenerator } = require("@opentelemetry/id-generator-aws-xray");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const { AwsInstrumentation } = require("opentelemetry-instrumentation-aws-sdk");
const { PeriodicExportingMetricReader } = require("@opentelemetry/sdk-metrics");
const {
  getNodeAutoInstrumentations,
} = require("@opentelemetry/auto-instrumentations-node");
const {
  OTLPMetricExporter,
} = require("@opentelemetry/exporter-metrics-otlp-grpc");
const {
  awsEcsDetector,
  awsEc2Detector,
} = require("@opentelemetry/resource-detector-aws");
const { DiagConsoleLogger, DiagLogLevel, diag } = require("@opentelemetry/api");

const _resource = Resource.default().merge(
  new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: "js-sample-app",
  })
);
//console
// const _traceExporter = new opentelemetry.tracing.ConsoleSpanExporter();
// const instrumentations = [getNodeAutoInstrumentations()];
//AWS
const _traceExporter = new OTLPTraceExporter();
const instrumentations = [
  new HttpInstrumentation(),
  new AwsInstrumentation({
    suppressInternalInstrumentation: true,
  }),
];

const _spanProcessor = new BatchSpanProcessor(_traceExporter);

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

const _tracerConfig = {
  idGenerator: new AWSXRayIdGenerator(),
};

// const _metricReader = new PeriodicExportingMetricReader({
//   exporter: new OTLPMetricExporter(),
//   exportIntervalMillis: 1000,
// });

module.exports = nodeSDKBuilder = async () => {
  const sdk = new opentelemetry.NodeSDK({
    textMapPropagator: new AWSXRayPropagator(),
    //    metricReader: _metricReader,
    instrumentations: instrumentations,
    resource: _resource,
    spanProcessor: _spanProcessor,
    traceExporter: _traceExporter,
  });
  sdk.configureTracerProvider(_tracerConfig, _spanProcessor);

  const resource = await detectResources({
    detectors: [awsEcsDetector, awsEc2Detector],
  });

  //const tracerProvider = new NodeTracerProvider({ resource });
  // this enables the API to record telemetry
  await sdk.start();
  // gracefully shut down the SDK on process exit
  process.on("SIGTERM", () => {
    sdk
      .shutdown()
      .then(() => console.log("Tracing and Metrics terminated"))
      .catch((error) =>
        console.log("Error terminating tracing and metrics", error)
      )
      .finally(() => process.exit(0));
  });
};
