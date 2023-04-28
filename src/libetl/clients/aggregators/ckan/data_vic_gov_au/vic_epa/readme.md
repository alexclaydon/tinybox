https://portal.api.epa.vic.gov.au/

Requires sign in.

https://portal.api.epa.vic.gov.au/docs/services/environmentMonitoring-v1/operations/get-parameters-single-site

It appears that you must also, once signed in, _subscribe_ to a given API.  See, e.g., [here](https://portal.api.epa.vic.gov.au/docs/services/environmentMonitoring-v1/operations/get-parameters-single-site/console).  In this case it required going [here](https://portal.api.epa.vic.gov.au/products?api=environmentMonitoring-v1) and clicking the "Environment Monitoring" link.  The first time I tried, it failed.  Second time appears to have worked.

[API Reference](https://portal.api.epa.vic.gov.au/docs/services/environmentMonitoring-v1/operations/get-sites-environmentalsegment?)

You can also try the API through the portal [here](https://portal.api.epa.vic.gov.au/docs/services/environmentMonitoring-v1/operations/get-sites-environmentalsegment/console).

[Licensing details](https://discover.data.vic.gov.au/dataset/environment-monitoring-api): Creative Commons Attribution 4.0 International.

See the [schema](interpretive/schema.json).  With this, you can:

- Validate JSON data against the schema to ensure it follows the correct structure and data types.
- Generate Python data classes or other language-specific data structures to represent the schema in your code.
- Generate example JSON data based on the schema, which can be useful for testing and documentation purposes.
- Generate API documentation, using tools like Swagger, that follow the OpenAPI Specification.
