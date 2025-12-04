flowchart LR
  %% Feeds
  subgraph Feeds[Feeds / External Systems]
    KS[KAFKA: Gamestate Topic(s)]
    KV[KAFKA: VRA / Broadcast Topic(s)]
    RCP_EXT[RCP Service (Rich Content Platform)\nHTTP GraphQL API]
  end

  %% Gamestate lib consumes Gamestate topics
  subgraph GamestateLib[Gamestate Lib (ingestion layer)]
    GC[FootballContainer / HorseRacingContainer / ...]
    Notifier[Notifier / Observer Registry\nGamestateLib.notifier]
  end

  %% Observers that react to gamestate changes
  subgraph Observers[Autofetch Observers]
    FOBS[FootballObserver\n- registered on FootballContainer\n- checks hasUpdatedHistoricalState()\n- config: messageOldestThan / minusTimeThreshold]
    HOBS[HorseRacingObserver\n- uses cache.putIfAbsent to prevent dup submissions]
  end

  %% Auto-fetch execution pipeline
  subgraph Executor[Auto-fetch Executor & Queue]
    EXEC[CacheRefresherExecutor\n(ThreadPoolExecutor)]
    PQUEUE[Priority Blocking Queue\n(PriorityCacheTask)]
    PTASK[PriorityCacheTask.run()\n-> CacheLoader.loadById(id)]
  end

  %% Cache loaders per sport
  subgraph CacheLoaders[CacheLoader Implementations]
    HFCL[HorseRacingCacheLoader\n-> meetingDataLoader.load(...) & raceDataLoader.refresh(...)]
    FBCL[FootballCacheLoader\n-> loads Football related RCP dataloaders]
    CACHELOADER_iface[CacheLoader interface\nloadById(String id, ApplicationContext)]
  end

  %% RCP dataloaders and caches
  subgraph RCP[RCP DataLoaders & Caches]
    RCP_DL[RCP DataLoaders\n(e.g. AmericanFootballFixtureDataLoader)\n@Cacheable/@CachePut]
    RCP_CACHE[Caffeine caches: RCP.*\nExamples:\n- RCP.AMERICAN_FOOTBALL.FIXTURE\n- RCP.FOOTBALL.FIXTURE\nConfig keys:\ncache.rcp.*.ttl, cache.rcp.*.fast.ttl,\nfast.timespan = 360 (mins = 6h),\nminusTimeThreshold = 7200 (secs = 2h)]
    REFRESH_REM[RefreshRemovalListener\n- re-enters & refreshes on expiry when conditions met]
  end

  %% VRA / broadcast pipeline (Kafka)
  subgraph VRA[VRA / Broadcasts]
    VRA_CONTAINER[VraListenerContainer\n- creates Kafka consumer container\n- topicName from config]
    VRA_LIST[EventDrivenMessageListener\n- AcknowledgingMessageListener<String, ScheduleMessage>\n- updates VRA cache\n- caches key = eventId + country]
    VRA_CACHE[Cache: VRA\nVRACache.putOnCache/loadFromCache\n(@CachePut / @Cacheable)]
  end

  %% SCA GraphQL layer and runtime
  subgraph SCA[SCA Service (GraphQL API)]
    GAMEDATA[Gamestate Datasources (live)\n(consumed via Gamestate Lib containers)]
    GRAPHQL[GraphQLProvider / GraphQLService\n- preparsed document cache\n- AppKeyManager / metrics / tracing]
    FETCHERS[GraphQL DataFetchers\n- BroadcastsDataFetcher -> VRA dataloader/cache\n- Various RCP dataloaders used by fetchers]
    JMX[JmxCacheOperations\n- clearCache / inspectCache (Caffeine)]
  end

  %% Clients
  Clients[Clients / Channels\n(web frontends, services)]

  %% Connections / data flows
  KS -->|ingest messages| GamestateLib
  GamestateLib -->|notify on changes| Notifier
  Notifier -->|registered observers get update()| FOBS
  Notifier --> HOBS

  FOBS -->|if shouldUpdate() & hasUpdatedHistoricalState()\nsubmitTask(startTime, id)| EXEC
  HOBS -->|submitTask when conditions met| EXEC

  EXEC --> PQUEUE
  PQUEUE --> PTASK
  PTASK -->|calls| CACHELOADER_iface
  CACHELOADER_iface --> HFCL
  CACHELOADER_iface --> FBCL

  HFCL -->|calls| RCP_DL
  FBCL --> RCP_DL
  RCP_DL -->|stores results via @CachePut/@Cacheable| RCP_CACHE
  RCP_CACHE -->|served to| FETCHERS
  FETCHERS --> GRAPHQL
  GRAPHQL -->|responds to| Clients

  KV -->|broadcast schedule messages| VRA_CONTAINER
  VRA_CONTAINER -->|message listener| VRA_LIST
  VRA_LIST -->|write broadcasters grouped by eventId+country| VRA_CACHE
  VRA_CACHE -->|used by| FETCHERS

  GamestateLib -->|live in-play queries| GAMEDATA
  GAMEDATA -->|used by| GRAPHQL

  RCP_CACHE -->|JMX ops inspect/clear| JMX
  VRA_CACHE --> JMX

  %% Additional nodes showing important config keys and behaviors
  subgraph Config[Key Configs & Notes]
    CFG1[minusTimeThreshold = 7200 (secs)\n- observer recency threshold]
    CFG2[fast.timespan = 360 (mins = 6h)\nfast.ttl, normal ttl (e.g. fixture.ttl = 24h)]
    CFG3[AutoFetch enabled flags per sport\n(e.g., enableFootballObserver=true)]
  end

  CFG1 -.-> FOBS
  CFG1 -.-> HOBS
  CFG2 -.-> RCP_CACHE
  CFG3 -.-> FOBS

  style RCP_CACHE fill:#fef3c7,stroke:#333,stroke-width:1px
  style VRA_CACHE fill:#dff0d8,stroke:#333,stroke-width:1px
  style GRAPHQL fill:#e6f7ff,stroke:#333,stroke-width:1px
  style EXEC fill:#f0f0f0,stroke:#333,stroke-width:1px
