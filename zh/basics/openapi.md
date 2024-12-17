---
icon: network-wired
---

# OpenAPI

您可以将 GitBook 页面与 OpenAPI 或 Swagger 文件或 URL 同步，以将自动生成的 API 方法包含在您的文档中。

### OpenAPI 块

GitBook 的 OpenAPI 块由 [Scalar](https://scalar.com/) 提供支持，因此您可以直接从文档中测试您的 API。

{% swagger src="https://petstore3.swagger.io/api/v3/openapi.json" path="/pet" method="post" %}
[https://petstore3.swagger.io/api/v3/openapi.json](https://petstore3.swagger.io/api/v3/openapi.json)
{% endswagger %}

仅测试开放 API 页面&#x20;
