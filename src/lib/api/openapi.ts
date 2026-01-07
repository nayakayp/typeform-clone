// OpenAPI 3.0 Specification for Typeform Clone API

export const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Typeform Clone API",
    version: "1.0.0",
    description: `
# Introduction

The Typeform Clone API provides programmatic access to forms, questions, responses, and webhooks.

## Authentication

All API requests require authentication using an API key. Include your API key in the Authorization header:

\`\`\`
Authorization: Bearer tf_live_your_api_key_here
\`\`\`

## Rate Limiting

API requests are rate-limited per workspace:
- Default: 100 requests per minute
- Responses endpoints: 100 requests per minute
- Create/Update operations: 30-60 requests per minute

Rate limit headers are included in all responses:
- \`X-RateLimit-Limit\`: Maximum requests allowed
- \`X-RateLimit-Remaining\`: Requests remaining in current window
- \`X-RateLimit-Reset\`: Timestamp when the limit resets

## Pagination

List endpoints support pagination with the following query parameters:
- \`page\`: Page number (default: 1)
- \`per_page\`: Items per page (default: 20, max: 100)

## Error Handling

Errors follow a consistent format:
\`\`\`json
{
  "error": {
    "code": "error_code",
    "message": "Human-readable message",
    "details": {}
  }
}
\`\`\`
    `,
    contact: {
      name: "API Support",
      email: "api@example.com",
    },
  },
  servers: [
    {
      url: "/api/v1",
      description: "API v1",
    },
  ],
  security: [
    {
      bearerAuth: [],
    },
  ],
  paths: {
    "/forms": {
      get: {
        summary: "List all forms",
        description: "Retrieve a paginated list of forms in the workspace",
        operationId: "listForms",
        tags: ["Forms"],
        parameters: [
          { $ref: "#/components/parameters/page" },
          { $ref: "#/components/parameters/perPage" },
          {
            name: "status",
            in: "query",
            description: "Filter by form status",
            schema: {
              type: "string",
              enum: ["draft", "published", "closed"],
            },
          },
          {
            name: "sort",
            in: "query",
            description: "Sort field",
            schema: {
              type: "string",
              enum: ["createdAt", "updatedAt", "title"],
              default: "createdAt",
            },
          },
          {
            name: "order",
            in: "query",
            description: "Sort order",
            schema: {
              type: "string",
              enum: ["asc", "desc"],
              default: "desc",
            },
          },
        ],
        responses: {
          "200": {
            description: "List of forms",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/FormListResponse",
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "429": { $ref: "#/components/responses/RateLimitExceeded" },
        },
      },
      post: {
        summary: "Create a form",
        description: "Create a new form in the workspace",
        operationId: "createForm",
        tags: ["Forms"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateFormRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Form created successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/FormResponse",
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/forms/{formId}": {
      get: {
        summary: "Get a form",
        description: "Retrieve a single form with its questions",
        operationId: "getForm",
        tags: ["Forms"],
        parameters: [{ $ref: "#/components/parameters/formId" }],
        responses: {
          "200": {
            description: "Form details",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/FormWithQuestionsResponse",
                },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
      put: {
        summary: "Update a form",
        description: "Update form properties",
        operationId: "updateForm",
        tags: ["Forms"],
        parameters: [{ $ref: "#/components/parameters/formId" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateFormRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Form updated successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/FormResponse",
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
      delete: {
        summary: "Delete a form",
        description: "Permanently delete a form and all its data",
        operationId: "deleteForm",
        tags: ["Forms"],
        parameters: [{ $ref: "#/components/parameters/formId" }],
        responses: {
          "200": {
            description: "Form deleted successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/DeleteResponse",
                },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/forms/{formId}/publish": {
      post: {
        summary: "Publish a form",
        description: "Publish a form to make it accessible to respondents",
        operationId: "publishForm",
        tags: ["Forms"],
        parameters: [{ $ref: "#/components/parameters/formId" }],
        responses: {
          "200": {
            description: "Form published successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/FormResponse",
                },
              },
            },
          },
          "400": {
            description: "Cannot publish form (e.g., no questions)",
          },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/forms/{formId}/close": {
      post: {
        summary: "Close a form",
        description: "Close a form to stop accepting new responses",
        operationId: "closeForm",
        tags: ["Forms"],
        parameters: [{ $ref: "#/components/parameters/formId" }],
        responses: {
          "200": {
            description: "Form closed successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/FormResponse",
                },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/forms/{formId}/questions": {
      get: {
        summary: "List questions",
        description: "Get all questions for a form",
        operationId: "listQuestions",
        tags: ["Questions"],
        parameters: [{ $ref: "#/components/parameters/formId" }],
        responses: {
          "200": {
            description: "List of questions",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/QuestionListResponse",
                },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
      post: {
        summary: "Add a question",
        description: "Add a new question to a form",
        operationId: "createQuestion",
        tags: ["Questions"],
        parameters: [{ $ref: "#/components/parameters/formId" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateQuestionRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Question created successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/QuestionResponse",
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/forms/{formId}/questions/reorder": {
      post: {
        summary: "Reorder questions",
        description: "Update the order of questions in a form",
        operationId: "reorderQuestions",
        tags: ["Questions"],
        parameters: [{ $ref: "#/components/parameters/formId" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["questionIds"],
                properties: {
                  questionIds: {
                    type: "array",
                    items: { type: "string", format: "uuid" },
                    description: "Question IDs in the desired order",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Questions reordered successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/QuestionListResponse",
                },
              },
            },
          },
        },
      },
    },
    "/questions/{questionId}": {
      get: {
        summary: "Get a question",
        description: "Retrieve a single question",
        operationId: "getQuestion",
        tags: ["Questions"],
        parameters: [{ $ref: "#/components/parameters/questionId" }],
        responses: {
          "200": {
            description: "Question details",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/QuestionResponse",
                },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
      put: {
        summary: "Update a question",
        description: "Update question properties",
        operationId: "updateQuestion",
        tags: ["Questions"],
        parameters: [{ $ref: "#/components/parameters/questionId" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateQuestionRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Question updated successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/QuestionResponse",
                },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
      delete: {
        summary: "Delete a question",
        description: "Delete a question from a form",
        operationId: "deleteQuestion",
        tags: ["Questions"],
        parameters: [{ $ref: "#/components/parameters/questionId" }],
        responses: {
          "200": {
            description: "Question deleted successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/DeleteResponse",
                },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/forms/{formId}/responses": {
      get: {
        summary: "List responses",
        description: "Get all responses for a form",
        operationId: "listResponses",
        tags: ["Responses"],
        parameters: [
          { $ref: "#/components/parameters/formId" },
          { $ref: "#/components/parameters/page" },
          { $ref: "#/components/parameters/perPage" },
          {
            name: "status",
            in: "query",
            description: "Filter by response status",
            schema: {
              type: "string",
              enum: ["in_progress", "completed", "partial"],
            },
          },
        ],
        responses: {
          "200": {
            description: "List of responses",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ResponseListResponse",
                },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/responses/{responseId}": {
      get: {
        summary: "Get a response",
        description: "Retrieve a single response with answers",
        operationId: "getResponse",
        tags: ["Responses"],
        parameters: [{ $ref: "#/components/parameters/responseId" }],
        responses: {
          "200": {
            description: "Response details",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ResponseDetailResponse",
                },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
      delete: {
        summary: "Delete a response",
        description: "Delete a response and all its answers",
        operationId: "deleteResponse",
        tags: ["Responses"],
        parameters: [{ $ref: "#/components/parameters/responseId" }],
        responses: {
          "200": {
            description: "Response deleted successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/DeleteResponse",
                },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/forms/{formId}/webhooks": {
      get: {
        summary: "List webhooks",
        description: "Get all webhooks for a form",
        operationId: "listWebhooks",
        tags: ["Webhooks"],
        parameters: [{ $ref: "#/components/parameters/formId" }],
        responses: {
          "200": {
            description: "List of webhooks",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/WebhookListResponse",
                },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
      post: {
        summary: "Create a webhook",
        description:
          "Create a new webhook for a form. The secret is only returned once on creation.",
        operationId: "createWebhook",
        tags: ["Webhooks"],
        parameters: [{ $ref: "#/components/parameters/formId" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateWebhookRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Webhook created successfully (includes secret)",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/WebhookWithSecretResponse",
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/webhooks/{webhookId}": {
      get: {
        summary: "Get a webhook",
        description: "Retrieve a single webhook",
        operationId: "getWebhook",
        tags: ["Webhooks"],
        parameters: [{ $ref: "#/components/parameters/webhookId" }],
        responses: {
          "200": {
            description: "Webhook details",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/WebhookResponse",
                },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
      put: {
        summary: "Update a webhook",
        description: "Update webhook properties",
        operationId: "updateWebhook",
        tags: ["Webhooks"],
        parameters: [{ $ref: "#/components/parameters/webhookId" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateWebhookRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Webhook updated successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/WebhookResponse",
                },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
      delete: {
        summary: "Delete a webhook",
        description: "Delete a webhook",
        operationId: "deleteWebhook",
        tags: ["Webhooks"],
        parameters: [{ $ref: "#/components/parameters/webhookId" }],
        responses: {
          "200": {
            description: "Webhook deleted successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/DeleteResponse",
                },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        description: "API key in the format: tf_live_xxx",
      },
    },
    parameters: {
      formId: {
        name: "formId",
        in: "path",
        required: true,
        schema: { type: "string", format: "uuid" },
        description: "Form ID",
      },
      questionId: {
        name: "questionId",
        in: "path",
        required: true,
        schema: { type: "string", format: "uuid" },
        description: "Question ID",
      },
      responseId: {
        name: "responseId",
        in: "path",
        required: true,
        schema: { type: "string", format: "uuid" },
        description: "Response ID",
      },
      webhookId: {
        name: "webhookId",
        in: "path",
        required: true,
        schema: { type: "string", format: "uuid" },
        description: "Webhook ID",
      },
      page: {
        name: "page",
        in: "query",
        schema: { type: "integer", minimum: 1, default: 1 },
        description: "Page number",
      },
      perPage: {
        name: "per_page",
        in: "query",
        schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
        description: "Items per page",
      },
    },
    responses: {
      Unauthorized: {
        description: "Authentication required",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
            example: {
              error: {
                code: "unauthorized",
                message: "Missing Authorization header",
              },
            },
          },
        },
      },
      NotFound: {
        description: "Resource not found",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
            example: {
              error: {
                code: "not_found",
                message: "Resource not found",
              },
            },
          },
        },
      },
      ValidationError: {
        description: "Validation error",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
      RateLimitExceeded: {
        description: "Rate limit exceeded",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
            example: {
              error: {
                code: "rate_limit_exceeded",
                message: "Too many requests. Please try again later.",
              },
            },
          },
        },
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          error: {
            type: "object",
            properties: {
              code: { type: "string" },
              message: { type: "string" },
              details: { type: "object" },
            },
            required: ["code", "message"],
          },
        },
      },
      DeleteResponse: {
        type: "object",
        properties: {
          data: {
            type: "object",
            properties: {
              deleted: { type: "boolean" },
              id: { type: "string", format: "uuid" },
            },
          },
        },
      },
      Pagination: {
        type: "object",
        properties: {
          total: { type: "integer" },
          page: { type: "integer" },
          perPage: { type: "integer" },
          totalPages: { type: "integer" },
        },
      },
      Form: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          title: { type: "string" },
          description: { type: "string", nullable: true },
          slug: { type: "string" },
          status: { type: "string", enum: ["draft", "published", "closed"] },
          isPublic: { type: "boolean" },
          settings: { type: "object" },
          publishedAt: { type: "string", format: "date-time", nullable: true },
          closedAt: { type: "string", format: "date-time", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Question: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          formId: { type: "string", format: "uuid" },
          type: { type: "string" },
          title: { type: "string", nullable: true },
          description: { type: "string", nullable: true },
          placeholder: { type: "string", nullable: true },
          order: { type: "integer" },
          required: { type: "boolean" },
          settings: { type: "object" },
          validations: { type: "object" },
          options: {
            type: "array",
            items: { $ref: "#/components/schemas/QuestionOption" },
          },
        },
      },
      QuestionOption: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          label: { type: "string" },
          value: { type: "string" },
          image: { type: "string", nullable: true },
          order: { type: "integer" },
        },
      },
      Response: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          formId: { type: "string", format: "uuid" },
          status: {
            type: "string",
            enum: ["in_progress", "completed", "partial"],
          },
          email: { type: "string", nullable: true },
          startedAt: { type: "string", format: "date-time" },
          completedAt: { type: "string", format: "date-time", nullable: true },
          answers: {
            type: "array",
            items: { $ref: "#/components/schemas/Answer" },
          },
        },
      },
      Answer: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          questionId: { type: "string", format: "uuid" },
          textValue: { type: "string", nullable: true },
          numberValue: { type: "number", nullable: true },
          booleanValue: { type: "boolean", nullable: true },
          dateValue: { type: "string", format: "date-time", nullable: true },
          jsonValue: { type: "object", nullable: true },
        },
      },
      Webhook: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          formId: { type: "string", format: "uuid" },
          url: { type: "string", format: "uri" },
          events: {
            type: "array",
            items: { type: "string" },
          },
          isActive: { type: "boolean" },
          hasSecret: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      CreateFormRequest: {
        type: "object",
        required: ["title"],
        properties: {
          title: { type: "string", minLength: 1, maxLength: 255 },
          description: { type: "string" },
          settings: { type: "object" },
          isPublic: { type: "boolean", default: true },
        },
      },
      UpdateFormRequest: {
        type: "object",
        properties: {
          title: { type: "string", minLength: 1, maxLength: 255 },
          description: { type: "string" },
          settings: { type: "object" },
          isPublic: { type: "boolean" },
          maxResponses: { type: "integer", nullable: true },
          closeAt: { type: "string", format: "date-time", nullable: true },
          openAt: { type: "string", format: "date-time", nullable: true },
        },
      },
      CreateQuestionRequest: {
        type: "object",
        required: ["type"],
        properties: {
          type: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          placeholder: { type: "string", maxLength: 255 },
          required: { type: "boolean", default: false },
          settings: { type: "object" },
          validations: { type: "object" },
          options: {
            type: "array",
            items: {
              type: "object",
              required: ["label"],
              properties: {
                label: { type: "string", minLength: 1, maxLength: 500 },
                value: { type: "string", maxLength: 255 },
                image: { type: "string" },
              },
            },
          },
        },
      },
      UpdateQuestionRequest: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          placeholder: { type: "string", maxLength: 255 },
          required: { type: "boolean" },
          settings: { type: "object" },
          validations: { type: "object" },
          options: {
            type: "array",
            items: {
              type: "object",
              required: ["label"],
              properties: {
                id: { type: "string", format: "uuid" },
                label: { type: "string", minLength: 1, maxLength: 500 },
                value: { type: "string", maxLength: 255 },
                image: { type: "string" },
              },
            },
          },
        },
      },
      CreateWebhookRequest: {
        type: "object",
        required: ["url"],
        properties: {
          url: { type: "string", format: "uri" },
          events: {
            type: "array",
            items: {
              type: "string",
              enum: [
                "response.created",
                "response.completed",
                "response.updated",
                "form.published",
                "form.closed",
              ],
            },
            default: ["response.completed"],
          },
          isActive: { type: "boolean", default: true },
        },
      },
      UpdateWebhookRequest: {
        type: "object",
        properties: {
          url: { type: "string", format: "uri" },
          events: {
            type: "array",
            items: { type: "string" },
          },
          isActive: { type: "boolean" },
        },
      },
      FormListResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/Form" },
          },
          meta: {
            type: "object",
            properties: {
              pagination: { $ref: "#/components/schemas/Pagination" },
            },
          },
        },
      },
      FormResponse: {
        type: "object",
        properties: {
          data: { $ref: "#/components/schemas/Form" },
        },
      },
      FormWithQuestionsResponse: {
        type: "object",
        properties: {
          data: {
            allOf: [
              { $ref: "#/components/schemas/Form" },
              {
                type: "object",
                properties: {
                  questions: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Question" },
                  },
                },
              },
            ],
          },
        },
      },
      QuestionListResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/Question" },
          },
        },
      },
      QuestionResponse: {
        type: "object",
        properties: {
          data: { $ref: "#/components/schemas/Question" },
        },
      },
      ResponseListResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/Response" },
          },
          meta: {
            type: "object",
            properties: {
              pagination: { $ref: "#/components/schemas/Pagination" },
            },
          },
        },
      },
      ResponseDetailResponse: {
        type: "object",
        properties: {
          data: { $ref: "#/components/schemas/Response" },
        },
      },
      WebhookListResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/Webhook" },
          },
        },
      },
      WebhookResponse: {
        type: "object",
        properties: {
          data: { $ref: "#/components/schemas/Webhook" },
        },
      },
      WebhookWithSecretResponse: {
        type: "object",
        properties: {
          data: {
            allOf: [
              { $ref: "#/components/schemas/Webhook" },
              {
                type: "object",
                properties: {
                  secret: {
                    type: "string",
                    description: "Webhook secret (only shown once on creation)",
                  },
                },
              },
            ],
          },
        },
      },
    },
  },
  tags: [
    {
      name: "Forms",
      description: "Manage forms",
    },
    {
      name: "Questions",
      description: "Manage questions within forms",
    },
    {
      name: "Responses",
      description: "Access form responses and answers",
    },
    {
      name: "Webhooks",
      description: "Configure webhooks for form events",
    },
  ],
};

export type OpenApiSpec = typeof openApiSpec;
