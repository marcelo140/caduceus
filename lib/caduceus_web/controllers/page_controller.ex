defmodule CaduceusWeb.PageController do
  use CaduceusWeb, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end
end
