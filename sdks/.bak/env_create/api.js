// 注册获取用户信息API
registerAPI({
  name: "创建环境",
  method: "POST",
  endpoint: "http://localhost:65535/sdk/create_env",
  description: "启动环境|创建浏览器",
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
      name: "env_id",
      type: "string",
      required: true,
      description: "环境ID",
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
  ],
  example: {
    request: {
      sdk: {
        brw: {
          env_id: "ddee0a32926b49f08db4ff76d91c4014",
        },
      },
    },
    response: {
      code: 0,
      msg: "ok ",
      result: {},
    },
  },
});
