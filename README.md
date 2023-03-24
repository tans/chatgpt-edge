
## 安装运行

#### 安装 Deno

curl -fsSL https://deno.land/x/install/install.sh | sh

#### Run the app

deno run --allow-net app.ts --daemon

http://localhost:8000/chat/api

#### 或者通过 cloudflare edge， deno deploy 等边缘计算平台部署。

## API 接口

POST /chat/api

Processes chat requests by sending them to the OpenAI GPT-3 API and returning the response.

#### Request

- Method: POST
- URL: `/chat/api`
- Headers:
  - `Content-Type: application/json`
- Body:
  ```json
  {
    "key": "string",
    "content": "string",
    "prefix": "string"
  }
  ```

#### Response

- Status Code: 200 OK
- Body:
  ```json
  {
    "text": "string"
  }
  ```

#### Example

```bash
curl -X POST \
  http://localhost:8000/chat/api \
  -H 'Content-Type: application/json' \
  -d '{
    "key": "openai-key",
    "content": "Hello, how are you?",
    "prefix": "你是个中文老师"
  }'
