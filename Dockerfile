FROM elixir:alpine
ENV MIX_ENV=prod

RUN mkdir /caduceus
WORKDIR /caduceus

RUN apk add --update git bash

RUN mix local.hex --force && \
    mix local.rebar --force

COPY config ./config
COPY lib ./lib
COPY priv ./priv
COPY mix.exs .
COPY mix.lock .

RUN mix deps.get
RUN mix deps.compile
RUN mix phx.digest
RUN mix release

CMD ["_build/prod/rel/caduceus/bin/caduceus", "start"]