defmodule Chat.MessagesFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Chat.Messages` context.
  """

  @doc """
  Generate a message.
  """
  def message_fixture(attrs \\ %{}) do
    {:ok, message} =
      attrs
      |> Enum.into(%{
        channel_id: 42,
        doc: "some doc",
        doc_type: :"txt,pdf,xml,odt,doc,docx,xlsx,html,csv,md",
        media: "some media",
        media_type: :"image,video,audio",
        receiver_id: "7488a646-e31f-11e4-aace-600308960662",
        sender_id: "7488a646-e31f-11e4-aace-600308960662",
        text: "some text"
      })
      |> Chat.Messages.create_message()

    message
  end
end
