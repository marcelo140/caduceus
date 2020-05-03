FROM elixir:alpine
ENV MIX_ENV=prod

RUN mkdir /caduceus
WORKDIR /caduceus

RUN apk add --update git bash nodejs npm

RUN mix local.hex --force && \
    mix local.rebar --force

COPY config ./config
COPY lib ./lib
COPY assets ./assets
COPY priv ./priv
COPY mix.exs .
COPY mix.lock .

RUN mix deps.get
RUN mix deps.compile
RUN npm install --prefix ./assets
RUN npm rebuild node-sass --prefix ./assets
RUN npm run deploy --prefix ./assets
RUN mix phx.digest
RUN mix release

CMD ["_build/prod/rel/caduceus/bin/caduceus", "start"]