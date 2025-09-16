defmodule ChatWeb.MessageControllerTest do
  use ChatWeb.ConnCase

  import Chat.MessagesFixtures
  alias Chat.Messages.Message

  @create_attrs %{
    text: "some text",
    doc: "some doc",
    sender_id: "7488a646-e31f-11e4-aace-600308960662",
    receiver_id: "7488a646-e31f-11e4-aace-600308960662",
    channel_id: 42,
    media: "some media",
    media_type: :"image,video,audio",
    doc_type: :"txt,pdf,xml,odt,doc,docx,xlsx,html,csv,md"
  }
  @update_attrs %{
    text: "some updated text",
    doc: "some updated doc",
    sender_id: "7488a646-e31f-11e4-aace-600308960668",
    receiver_id: "7488a646-e31f-11e4-aace-600308960668",
    channel_id: 43,
    media: "some updated media",
    media_type: :"image,video,audio",
    doc_type: :"txt,pdf,xml,odt,doc,docx,xlsx,html,csv,md"
  }
  @invalid_attrs %{text: nil, doc: nil, sender_id: nil, receiver_id: nil, channel_id: nil, media: nil, media_type: nil, doc_type: nil}

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  describe "index" do
    test "lists all messages", %{conn: conn} do
      conn = get(conn, ~p"/api/messages")
      assert json_response(conn, 200)["data"] == []
    end
  end

  describe "create message" do
    test "renders message when data is valid", %{conn: conn} do
      conn = post(conn, ~p"/api/messages", message: @create_attrs)
      assert %{"id" => id} = json_response(conn, 201)["data"]

      conn = get(conn, ~p"/api/messages/#{id}")

      assert %{
               "id" => ^id,
               "channel_id" => 42,
               "doc" => "some doc",
               "doc_type" => "txt,pdf,xml,odt,doc,docx,xlsx,html,csv,md",
               "media" => "some media",
               "media_type" => "image,video,audio",
               "receiver_id" => "7488a646-e31f-11e4-aace-600308960662",
               "sender_id" => "7488a646-e31f-11e4-aace-600308960662",
               "text" => "some text"
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post(conn, ~p"/api/messages", message: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "update message" do
    setup [:create_message]

    test "renders message when data is valid", %{conn: conn, message: %Message{id: id} = message} do
      conn = put(conn, ~p"/api/messages/#{message}", message: @update_attrs)
      assert %{"id" => ^id} = json_response(conn, 200)["data"]

      conn = get(conn, ~p"/api/messages/#{id}")

      assert %{
               "id" => ^id,
               "channel_id" => 43,
               "doc" => "some updated doc",
               "doc_type" => "txt,pdf,xml,odt,doc,docx,xlsx,html,csv,md",
               "media" => "some updated media",
               "media_type" => "image,video,audio",
               "receiver_id" => "7488a646-e31f-11e4-aace-600308960668",
               "sender_id" => "7488a646-e31f-11e4-aace-600308960668",
               "text" => "some updated text"
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn, message: message} do
      conn = put(conn, ~p"/api/messages/#{message}", message: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "delete message" do
    setup [:create_message]

    test "deletes chosen message", %{conn: conn, message: message} do
      conn = delete(conn, ~p"/api/messages/#{message}")
      assert response(conn, 204)

      assert_error_sent 404, fn ->
        get(conn, ~p"/api/messages/#{message}")
      end
    end
  end

  defp create_message(_) do
    message = message_fixture()

    %{message: message}
  end
end
