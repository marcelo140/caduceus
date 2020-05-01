defmodule Caduceus.Repo do
  use Ecto.Repo,
    otp_app: :caduceus,
    adapter: Ecto.Adapters.Postgres
end
