// 注册获取用户信息API
registerAPI({
  name: "初始化SDK",
  method: "POST",
  endpoint: "http://localhost:65535/sdk/init",
  description: "初始化SDK，获取必要的配置信息。",
  flowchart: `graph TB
        %% Top-level controller / API
        A["main<br/>控制器 / API<br/><i>http-port: 65535</i>"]

        %% Queue and scheduler
        subgraph QueueLayer[队列与调度]
            Q["Redis / Task Queue\\n(Redis + Bull / RQ)"]
            S["Scheduler\\n(速率/优先/重试)"]
            Q --> S
        end

        A -->|POST task| Q
        A -->|admin ops| S

        %% Worker pool and browser instances
        subgraph WorkerPool[Worker 池（容器化）]
            direction TB
            W1["worker-1\\n(chromium worker)\\nprofile: /profiles/inst-1"]
            W2["worker-2\\n(chromium worker)\\nprofile: /profiles/inst-2"]
            W3["worker-N\\n(...可 scale) "]
            W1 ---|takes job| Q
            W2 ---|takes job| Q
            W3 ---|takes job| Q
        end

        %% Browser lifecycle endpoints (inside worker)
        W1 --> O["brw/open\\n(创建浏览器上下文)"]
        W1 --> C["brw/close\\n(销毁 & 清理)"]
        W2 --> O
        W2 --> C

        %% Proxy / Network layer
        subgraph Network[网络与代理池]
            PPool["Proxy Pool\\n(residential / SOCKS / HTTP)"]
            IPCheck["IP 验证\\n(httpbin/ip) "]
            PPool --> IPCheck
        end
        W1 -->|bind proxy| PPool
        W2 -->|bind proxy| PPool
        W3 -->|bind proxy| PPool

        %% CAPTCHA & human solve
        Captcha["CAPTCHA 服务\\n(2Captcha / 人工) "]
        W1 -->|captcha challenge| Captcha
        W2 -->|captcha challenge| Captcha

        %% Storage and results
        subgraph Storage[结果存储]
            ES["Elasticsearch / Postgres"]
            S3["S3 / Object Store (screenshots)"]
            ES --> S3
        end
        W1 -->|store results| ES
        W2 -->|store screenshots| S3

        %% Monitoring & logs
        subgraph Observability[监控 & 日志]
            Prom["Prometheus"]
            Graf["Grafana"]
            Loki["Loki / ELK" ]
            Prom --> Graf
            W1 -->|metrics| Prom
            W2 -->|metrics| Prom
            W1 -->|logs| Loki
            W2 -->|logs| Loki
        end

        %% Notes / styling
        classDef entry fill:#f8f9fa,stroke:#2b6cb0,stroke-width:1px,color:#1a202c,font-weight:600;
        classDef action fill:#ffffff,stroke:#cbd5e1,stroke-width:1px,color:#2d3748;
        class A entry;
        class Q,S,PPool,ES,S3,Prom,Graf,Loki action;`,
  parameters: [
    {
      name: "api_key",
      type: "string",
      required: true,
      description: "商户令牌",
    },
    {
      name: "api_secret",
      type: "string",
      required: true,
      description: "商户密钥",
    },
    {
      name: "data_dir",
      type: "string",
      required: true,
      description: "数据目录路径，用于存储SDK相关数据",
    },
  ],
  response: [
    {
      name: "code",
      type: "int",
      description: "状态码",
    },
    {
      name: "msg",
      type: "string",
      description: "消息描述",
    },
    {
      name: "result",
      type: "object",
      description: "返回结果",
    },
    {
      name: "company",
      type: "string",
      description: "商户名称",
    },
    {
      name: "branding",
      type: "string",
      description: "品牌标识",
    },
  ],
  example: {
    request: {
      sdk: {
        api_key: "cl_live_6f8d1b4ea0c64d9b8a2d3e5f7c9a1b2c",
        api_secret:
          "sec_8cdd81fe2e7b4c5aa13e30b67f9d2a6c3e4b5d6f1a2b3c4d5e6f7a8b9c0d1e2",
        data_dir: "C:/Users/Administrator/AppData/Roaming/Clsdk",
      },
    },
    response: {
      code: 0,
      msg: "ok ",
      result: {
        sdk: {
          company: "Starlink",
          branding: "X",
        },
      },
    },
  },
});
