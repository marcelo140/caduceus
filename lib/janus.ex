defmodule Caduceus.Janus do
  def start_session do
    response = HTTPoison.post!("localhost:8088/janus", 
      Jason.encode!(%{ 
        janus: "create",
        transaction: "#{:rand.uniform(1000)}"
      })
    )

    r = Jason.decode!(response.body)
    r["data"]["id"]
  end

  def plugin_for_session(id) do
    response = HTTPoison.post!("localhost:8088/janus/#{id}",
      Jason.encode!(%{
        janus: "attach",
        plugin: "janus.plugin.echotest",
        transaction: "#{:rand.uniform(1000)}"
      })
    )

    r = Jason.decode!(response.body)
    r["data"]["id"]
  end

  def echo(session, plugin) do
    response = HTTPoison.post!("localhost:8088/janus/#{session}/#{plugin}",
      Jason.encode!(%{
        janus: "message",
        transaction: "#{:rand.uniform(1000)}",
        body: %{
          record: true
        }
      })
    )

    Jason.decode!(response.body)
  end

  def listen_events(id) do
    r = HTTPoison.get!("localhost:8088/janus/#{id}")
    Jason.decode!(r.body)
  end
end
