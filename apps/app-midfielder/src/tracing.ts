import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

// The exporter reads OTEL_EXPORTER_OTLP_ENDPOINT and the SDK reads OTEL_SERVICE_NAME.
// Auto-instrumentation traces Express and fetch, and injects trace headers into outgoing calls.
new NodeSDK({
  traceExporter: new OTLPTraceExporter(),
  instrumentations: [getNodeAutoInstrumentations()],
}).start();
