{
  "message": "[Creem] Full Payload: {\n  \"webhookEventType\": \"checkout.completed\",\n  \"webhookId\": \"evt_4Zs6alLV1y4ZJPjs5BVCLz\",\n  \"webhookCreatedAt\": 1765486011809,\n  \"id\": \"ch_XztzzVbydvNShCkwBrfhe\",\n  \"object\": \"checkout\",\n  \"order\": {\n    \"object\": \"order\",\n    \"id\": \"ord_7FmJt1d78l5VERb2fKAKYO\",\n    \"customer\": \"cust_3Cz2eQ0Xj8O0XeIvC1auRN\",\n    \"product\": \"prod_4vYeqb4GliF45ShZtj5v4z\",\n    \"amount\": 14900,\n    \"currency\": \"EUR\",\n    \"sub_total\": 14900,\n    \"tax_amount\": 0,\n    \"amount_due\": 14900,\n    \"amount_paid\": 14900,\n    \"status\": \"paid\",\n    \"type\": \"onetime\",\n    \"transaction\": \"tran_579JQJt3JsHv4UYtkej3nP\",\n    \"created_at\": \"2025-12-11T20:46:13.880Z\",\n    \"updated_at\": \"2025-12-11T20:46:13.880Z\",\n    \"mode\": \"test\"\n  },\n  \"product\": {\n    \"id\": \"prod_4vYeqb4GliF45ShZtj5v4z\",\n    \"object\": \"product\",\n    \"name\": \"Lifetime subscription launch deal EU\",\n    \"description\": \"Lifetime subscription for Stepps.AI\",\n    \"image_url\": \"https://nucn5fajkcc6sgrd.public.blob.vercel-storage.com/apple-touch-icon-4uavImVTa4lBj8U2H4DkoDwRrwxjCz.png\",\n    \"price\": 14900,\n    \"currency\": \"EUR\",\n    \"billing_type\": \"onetime\",\n    \"billing_period\": \"once\",\n    \"status\": \"active\",\n    \"tax_mode\": \"inclusive\",\n    \"tax_category\": \"saas\",\n    \"default_success_url\": \"\",\n    \"created_at\": \"2025-12-10T14:02:18.373Z\",\n    \"updated_at\": \"2025-12-10T14:02:18.373Z\",\n    \"mode\": \"test\"\n  },\n  \"units\": 1,\n  \"success_url\": \"https://stage.stepps.ai/payment/success\",\n  \"customer\": {\n    \"id\": \"cust_3Cz2eQ0Xj8O0XeIvC1auRN\",\n    \"object\": \"customer\",\n    \"email\": \"wesseldieben01@gmail.com\",\n    \"name\": \"Werner Johannes Dieben\",\n    \"country\": \"NL\",\n    \"created_at\": \"2025-12-11T07:35:16.128Z\",\n    \"updated_at\": \"2025-12-11T07:35:16.128Z\",\n    \"mode\": \"test\"\n  },\n  \"status\": \"completed\",\n  \"metadata\": {\n    \"referenceId\": \"VyB2oKDo0EtCinV36VKMnOdKLiFZVy5i\"\n  },\n  \"mode\": \"test\"\n}",
  "$workers": {
    "truncated": false,
    "event": {
      "request": {
        "url": "https://stage.stepps.ai/api/auth/creem/webhook",
        "method": "POST",
        "path": "/api/auth/creem/webhook"
      }
    },
    "outcome": "ok",
    "scriptName": "user-application-stage",
    "eventType": "fetch",
    "executionModel": "stateless",
    "scriptVersion": {
      "id": "d4c9b28c-6a89-4f70-800c-8a586bca859e"
    },
    "requestId": "9ac7d5762e2ccef6"
  },
  "$metadata": {
    "id": "01KC7JN9NTKR86HE1AJ5A2T9RB",
    "requestId": "9ac7d5762e2ccef6",
    "trigger": "POST /api/auth/creem/webhook",
    "service": "user-application-stage",
    "message": "[Creem] Full Payload: {\n  \"webhookEventType\": \"checkout.completed\",\n  \"webhookId\": \"evt_4Zs6alLV1y4ZJPjs5BVCLz\",\n  \"webhookCreatedAt\": 1765486011809,\n  \"id\": \"ch_XztzzVbydvNShCkwBrfhe\",\n  \"object\": \"checkout\",\n  \"order\": {\n    \"object\": \"order\",\n    \"id\": \"ord_7FmJt1d78l5VERb2fKAKYO\",\n    \"customer\": \"cust_3Cz2eQ0Xj8O0XeIvC1auRN\",\n    \"product\": \"prod_4vYeqb4GliF45ShZtj5v4z\",\n    \"amount\": 14900,\n    \"currency\": \"EUR\",\n    \"sub_total\": 14900,\n    \"tax_amount\": 0,\n    \"amount_due\": 14900,\n    \"amount_paid\": 14900,\n    \"status\": \"paid\",\n    \"type\": \"onetime\",\n    \"transaction\": \"tran_579JQJt3JsHv4UYtkej3nP\",\n    \"created_at\": \"2025-12-11T20:46:13.880Z\",\n    \"updated_at\": \"2025-12-11T20:46:13.880Z\",\n    \"mode\": \"test\"\n  },\n  \"product\": {\n    \"id\": \"prod_4vYeqb4GliF45ShZtj5v4z\",\n    \"object\": \"product\",\n    \"name\": \"Lifetime subscription launch deal EU\",\n    \"description\": \"Lifetime subscription for Stepps.AI\",\n    \"image_url\": \"https://nucn5fajkcc6sgrd.public.blob.vercel-storage.com/apple-touch-icon-4uavImVTa4lBj8U2H4DkoDwRrwxjCz.png\",\n    \"price\": 14900,\n    \"currency\": \"EUR\",\n    \"billing_type\": \"onetime\",\n    \"billing_period\": \"once\",\n    \"status\": \"active\",\n    \"tax_mode\": \"inclusive\",\n    \"tax_category\": \"saas\",\n    \"default_success_url\": \"\",\n    \"created_at\": \"2025-12-10T14:02:18.373Z\",\n    \"updated_at\": \"2025-12-10T14:02:18.373Z\",\n    \"mode\": \"test\"\n  },\n  \"units\": 1,\n  \"success_url\": \"https://stage.stepps.ai/payment/success\",\n  \"customer\": {\n    \"id\": \"cust_3Cz2eQ0Xj8O0XeIvC1auRN\",\n    \"object\": \"customer\",\n    \"email\": \"wesseldieben01@gmail.com\",\n    \"name\": \"Werner Johannes Dieben\",\n    \"country\": \"NL\",\n    \"created_at\": \"2025-12-11T07:35:16.128Z\",\n    \"updated_at\": \"2025-12-11T07:35:16.128Z\",\n    \"mode\": \"test\"\n  },\n  \"status\": \"completed\",\n  \"metadata\": {\n    \"referenceId\": \"VyB2oKDo0EtCinV36VKMnOdKLiFZVy5i\"\n  },\n  \"mode\": \"test\"\n}",
    "account": "c2ed9b335ebebbe0fbfa7aa17935b3b5",
    "type": "cf-worker",
    "fingerprint": "119aff34208c8c780f04f434edb4d662",
    "origin": "fetch",
    "messageTemplate": "[Creem] Full Payload: {\n  \"webhookEventType\": \"<DOMAIN>\",\n  \"webhookId\": \"evt_4Zs6alLV1y4ZJPjs5BVCLz\",\n  \"webhookCreatedAt\": 1765486011809,\n  \"id\": \"ch_XztzzVbydvNShCkwBrfhe\",\n  \"object\": \"checkout\",\n  \"order\": {\n    \"object\": \"order\",\n    \"id\": \"ord_7FmJt1d78l5VERb2fKAKYO\",\n    \"customer\": \"cust_3Cz2eQ0Xj8O0XeIvC1auRN\",\n    \"product\": \"prod_4vYeqb4GliF45ShZtj5v4z\",\n    \"amount\": 14900,\n    \"currency\": \"EUR\",\n    \"sub_total\": 14900,\n    \"tax_amount\": 0,\n    \"amount_due\": 14900,\n    \"amount_paid\": 14900,\n    \"status\": \"paid\",\n    \"type\": \"onetime\",\n    \"transaction\": \"tran_579JQJt3JsHv4UYtkej3nP\",\n    \"created_at\": \"<DATETIME>\",\n    \"updated_at\": \"<DATETIME>\",\n    \"mode\": \"test\"\n  },\n  \"product\": {\n    \"id\": \"prod_4vYeqb4GliF45ShZtj5v4z\",\n    \"object\": \"product\",\n    \"name\": \"Lifetime subscription launch deal EU\",\n    \"description\": \"Lifetime subscription for <DOMAIN>\",\n    \"image_url\": \"https://nucn5fajkcc6sgrd.public.blob.vercel-storage.com/apple-touch-icon-4uavImVTa4lBj8U2H4DkoDwRrwxjCz.png\",\n    \"price\": 14900,\n    \"currency\": \"EUR\",\n    \"billing_type\": \"onetime\",\n    \"billing_period\": \"once\",\n    \"status\": \"active\",\n    \"tax_mode\": \"inclusive\",\n    \"tax_category\": \"saas\",\n    \"default_success_url\": \"\",\n    \"created_at\": \"<DATETIME>\",\n    \"updated_at\": \"<DATETIME>\",\n    \"mode\": \"test\"\n  },\n  \"units\": 1,\n  \"success_url\": \"https://stage.stepps.ai/payment/success\",\n  \"customer\": {\n    \"id\": \"cust_3Cz2eQ0Xj8O0XeIvC1auRN\",\n    \"object\": \"customer\",\n    \"email\": \"<EMAIL>\",\n    \"name\": \"Werner Johannes Dieben\",\n    \"country\": \"NL\",\n    \"created_at\": \"<DATETIME>\",\n    \"updated_at\": \"<DATETIME>\",\n    \"mode\": \"test\"\n  },\n  \"status\": \"completed\",\n  \"metadata\": {\n    \"referenceId\": \"VyB2oKDo0EtCinV36VKMnOdKLiFZVy5i\"\n  },\n  \"mode\": \"test\"\n}"
  }
}
{
  "message": "[Creem] Metadata: {\n  \"referenceId\": \"VyB2oKDo0EtCinV36VKMnOdKLiFZVy5i\"\n}",
  "$workers": {
    "truncated": false,
    "event": {
      "request": {
        "url": "https://stage.stepps.ai/api/auth/creem/webhook",
        "method": "POST",
        "path": "/api/auth/creem/webhook"
      }
    },
    "outcome": "ok",
    "scriptName": "user-application-stage",
    "eventType": "fetch",
    "executionModel": "stateless",
    "scriptVersion": {
      "id": "d4c9b28c-6a89-4f70-800c-8a586bca859e"
    },
    "requestId": "9ac7d5762e2ccef6"
  },
  "$metadata": {
    "id": "01KC7JN9NTKR86HE1AJ5A2T9RA",
    "requestId": "9ac7d5762e2ccef6",
    "trigger": "POST /api/auth/creem/webhook",
    "service": "user-application-stage",
    "message": "[Creem] Metadata: {\n  \"referenceId\": \"VyB2oKDo0EtCinV36VKMnOdKLiFZVy5i\"\n}",
    "account": "c2ed9b335ebebbe0fbfa7aa17935b3b5",
    "type": "cf-worker",
    "fingerprint": "119aff34208c8c780f04f434edb4d662",
    "origin": "fetch",
    "messageTemplate": "[Creem] Metadata: {\n  \"referenceId\": \"VyB2oKDo0EtCinV36VKMnOdKLiFZVy5i\"\n}"
  }
}
{
  "message": "[Creem] Product: {\n  \"id\": \"prod_4vYeqb4GliF45ShZtj5v4z\",\n  \"object\": \"product\",\n  \"name\": \"Lifetime subscription launch deal EU\",\n  \"description\": \"Lifetime subscription for Stepps.AI\",\n  \"image_url\": \"https://nucn5fajkcc6sgrd.public.blob.vercel-storage.com/apple-touch-icon-4uavImVTa4lBj8U2H4DkoDwRrwxjCz.png\",\n  \"price\": 14900,\n  \"currency\": \"EUR\",\n  \"billing_type\": \"onetime\",\n  \"billing_period\": \"once\",\n  \"status\": \"active\",\n  \"tax_mode\": \"inclusive\",\n  \"tax_category\": \"saas\",\n  \"default_success_url\": \"\",\n  \"created_at\": \"2025-12-10T14:02:18.373Z\",\n  \"updated_at\": \"2025-12-10T14:02:18.373Z\",\n  \"mode\": \"test\"\n}",
  "$workers": {
    "truncated": false,
    "event": {
      "request": {
        "url": "https://stage.stepps.ai/api/auth/creem/webhook",
        "method": "POST",
        "path": "/api/auth/creem/webhook"
      }
    },
    "outcome": "ok",
    "scriptName": "user-application-stage",
    "eventType": "fetch",
    "executionModel": "stateless",
    "scriptVersion": {
      "id": "d4c9b28c-6a89-4f70-800c-8a586bca859e"
    },
    "requestId": "9ac7d5762e2ccef6"
  },
  "$metadata": {
    "id": "01KC7JN9NTKR86HE1AJ5A2T9R9",
    "requestId": "9ac7d5762e2ccef6",
    "trigger": "POST /api/auth/creem/webhook",
    "service": "user-application-stage",
    "message": "[Creem] Product: {\n  \"id\": \"prod_4vYeqb4GliF45ShZtj5v4z\",\n  \"object\": \"product\",\n  \"name\": \"Lifetime subscription launch deal EU\",\n  \"description\": \"Lifetime subscription for Stepps.AI\",\n  \"image_url\": \"https://nucn5fajkcc6sgrd.public.blob.vercel-storage.com/apple-touch-icon-4uavImVTa4lBj8U2H4DkoDwRrwxjCz.png\",\n  \"price\": 14900,\n  \"currency\": \"EUR\",\n  \"billing_type\": \"onetime\",\n  \"billing_period\": \"once\",\n  \"status\": \"active\",\n  \"tax_mode\": \"inclusive\",\n  \"tax_category\": \"saas\",\n  \"default_success_url\": \"\",\n  \"created_at\": \"2025-12-10T14:02:18.373Z\",\n  \"updated_at\": \"2025-12-10T14:02:18.373Z\",\n  \"mode\": \"test\"\n}",
    "account": "c2ed9b335ebebbe0fbfa7aa17935b3b5",
    "type": "cf-worker",
    "fingerprint": "119aff34208c8c780f04f434edb4d662",
    "origin": "fetch",
    "messageTemplate": "[Creem] Product: {\n  \"id\": \"prod_4vYeqb4GliF45ShZtj5v4z\",\n  \"object\": \"product\",\n  \"name\": \"Lifetime subscription launch deal EU\",\n  \"description\": \"Lifetime subscription for <DOMAIN>\",\n  \"image_url\": \"https://nucn5fajkcc6sgrd.public.blob.vercel-storage.com/apple-touch-icon-4uavImVTa4lBj8U2H4DkoDwRrwxjCz.png\",\n  \"price\": 14900,\n  \"currency\": \"EUR\",\n  \"billing_type\": \"onetime\",\n  \"billing_period\": \"once\",\n  \"status\": \"active\",\n  \"tax_mode\": \"inclusive\",\n  \"tax_category\": \"saas\",\n  \"default_success_url\": \"\",\n  \"created_at\": \"<DATETIME>\",\n  \"updated_at\": \"<DATETIME>\",\n  \"mode\": \"test\"\n}"
  }
}
{
  "message": "[Creem] Customer: {\n  \"id\": \"cust_3Cz2eQ0Xj8O0XeIvC1auRN\",\n  \"object\": \"customer\",\n  \"email\": \"wesseldieben01@gmail.com\",\n  \"name\": \"Werner Johannes Dieben\",\n  \"country\": \"NL\",\n  \"created_at\": \"2025-12-11T07:35:16.128Z\",\n  \"updated_at\": \"2025-12-11T07:35:16.128Z\",\n  \"mode\": \"test\"\n}",
  "$workers": {
    "truncated": false,
    "event": {
      "request": {
        "url": "https://stage.stepps.ai/api/auth/creem/webhook",
        "method": "POST",
        "path": "/api/auth/creem/webhook"
      }
    },
    "outcome": "ok",
    "scriptName": "user-application-stage",
    "eventType": "fetch",
    "executionModel": "stateless",
    "scriptVersion": {
      "id": "d4c9b28c-6a89-4f70-800c-8a586bca859e"
    },
    "requestId": "9ac7d5762e2ccef6"
  },
  "$metadata": {
    "id": "01KC7JN9NTKR86HE1AJ5A2T9R8",
    "requestId": "9ac7d5762e2ccef6",
    "trigger": "POST /api/auth/creem/webhook",
    "service": "user-application-stage",
    "message": "[Creem] Customer: {\n  \"id\": \"cust_3Cz2eQ0Xj8O0XeIvC1auRN\",\n  \"object\": \"customer\",\n  \"email\": \"wesseldieben01@gmail.com\",\n  \"name\": \"Werner Johannes Dieben\",\n  \"country\": \"NL\",\n  \"created_at\": \"2025-12-11T07:35:16.128Z\",\n  \"updated_at\": \"2025-12-11T07:35:16.128Z\",\n  \"mode\": \"test\"\n}",
    "account": "c2ed9b335ebebbe0fbfa7aa17935b3b5",
    "type": "cf-worker",
    "fingerprint": "119aff34208c8c780f04f434edb4d662",
    "origin": "fetch",
    "messageTemplate": "[Creem] Customer: {\n  \"id\": \"cust_3Cz2eQ0Xj8O0XeIvC1auRN\",\n  \"object\": \"customer\",\n  \"email\": \"<EMAIL>\",\n  \"name\": \"Werner Johannes Dieben\",\n  \"country\": \"NL\",\n  \"created_at\": \"<DATETIME>\",\n  \"updated_at\": \"<DATETIME>\",\n  \"mode\": \"test\"\n}"
  }
}
{
  "message": "Query: select \"id\", \"name\", \"email\", \"email_verified\", \"image\", \"created_at\", \"updated_at\", \"avatar_url\", \"notification_preferences\", \"creem_customer_id\" from \"users\" where \"users\".\"id\" = $1 -- params: [\"VyB2oKDo0EtCinV36VKMnOdKLiFZVy5i\"]",
  "$workers": {
    "truncated": false,
    "event": {
      "request": {
        "url": "https://stage.stepps.ai/api/auth/creem/webhook",
        "method": "POST",
        "path": "/api/auth/creem/webhook"
      }
    },
    "outcome": "ok",
    "scriptName": "user-application-stage",
    "eventType": "fetch",
    "executionModel": "stateless",
    "scriptVersion": {
      "id": "d4c9b28c-6a89-4f70-800c-8a586bca859e"
    },
    "requestId": "9ac7d5762e2ccef6"
  },
  "$metadata": {
    "id": "01KC7JN9N20VV77GHQE3EETB5R",
    "requestId": "9ac7d5762e2ccef6",
    "trigger": "POST /api/auth/creem/webhook",
    "service": "user-application-stage",
    "message": "Query: select \"id\", \"name\", \"email\", \"email_verified\", \"image\", \"created_at\", \"updated_at\", \"avatar_url\", \"notification_preferences\", \"creem_customer_id\" from \"users\" where \"users\".\"id\" = $1 -- params: [\"VyB2oKDo0EtCinV36VKMnOdKLiFZVy5i\"]",
    "account": "c2ed9b335ebebbe0fbfa7aa17935b3b5",
    "type": "cf-worker",
    "fingerprint": "119aff34208c8c780f04f434edb4d662",
    "origin": "fetch",
    "messageTemplate": "Query: select \"id\", \"name\", \"email\", \"email_verified\", \"image\", \"created_at\", \"updated_at\", \"avatar_url\", \"notification_preferences\", \"creem_customer_id\" from \"users\" where \"users\".\"id\" = $1 -- params: [\"VyB2oKDo0EtCinV36VKMnOdKLiFZVy5i\"]"
  }
}
{
  "message": "[Creem] EVENT: Checkout Completed",
  "$workers": {
    "truncated": false,
    "event": {
      "request": {
        "url": "https://stage.stepps.ai/api/auth/creem/webhook",
        "method": "POST",
        "path": "/api/auth/creem/webhook"
      }
    },
    "outcome": "ok",
    "scriptName": "user-application-stage",
    "eventType": "fetch",
    "executionModel": "stateless",
    "scriptVersion": {
      "id": "d4c9b28c-6a89-4f70-800c-8a586bca859e"
    },
    "requestId": "9ac7d5762e2ccef6"
  },
  "$metadata": {
    "id": "01KC7JN9NTKR86HE1AJ5A2T9R7",
    "requestId": "9ac7d5762e2ccef6",
    "trigger": "POST /api/auth/creem/webhook",
    "service": "user-application-stage",
    "message": "[Creem] EVENT: Checkout Completed",
    "account": "c2ed9b335ebebbe0fbfa7aa17935b3b5",
    "type": "cf-worker",
    "fingerprint": "119aff34208c8c780f04f434edb4d662",
    "origin": "fetch",
    "messageTemplate": "[Creem] EVENT: Checkout Completed"
  }
}