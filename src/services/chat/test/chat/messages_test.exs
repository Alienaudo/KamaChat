defmodule Chat.MessagesTest do
  use Chat.DataCase

  alias Chat.Messages

  describe "messages" do
    alias Chat.Messages.Message

    import Chat.MessagesFixtures

    @invalid_attrs %{text: nil, doc: nil, sender_id: nil, receiver_id: nil, channel_id: nil, media: nil, media_type: nil, doc_type: nil}

    test "list_messages/0 returns all messages" do
      message = message_fixture()
      assert Messages.list_messages() == [message]
    end

    test "get_message!/1 returns the message with given id" do
      message = message_fixture()
      assert Messages.get_message!(message.id) == message
    end

    test "create_message/1 with valid data creates a message" do
      valid_attrs = %{text: "some text", doc: "some doc", sender_id: "7488a646-e31f-11e4-aace-600308960662", receiver_id: "7488a646-e31f-11e4-aace-600308960662", channel_id: 42, media: "some media", media_type: :"image,video,audio", doc_type: :"txt,pdf,xml,odt,doc,docx,xlsx,html,csv,md"}

      assert {:ok, %Message{} = message} = Messages.create_message(valid_attrs)
      assert message.text == "some text"
      assert message.doc == "some doc"
      assert message.sender_id == "7488a646-e31f-11e4-aace-600308960662"
      assert message.receiver_id == "7488a646-e31f-11e4-aace-600308960662"
      assert message.channel_id == 42
      assert message.media == "some media"
      assert message.media_type == :"image,video,audio"
      assert message.doc_type == :"txt,pdf,xml,odt,doc,docx,xlsx,html,csv,md"
    end

    test "create_message/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Messages.create_message(@invalid_attrs)
    end

    test "update_message/2 with valid data updates the message" do
      message = message_fixture()
      update_attrs = %{text: "some updated text", doc: "some updated doc", sender_id: "7488a646-e31f-11e4-aace-600308960668", receiver_id: "7488a646-e31f-11e4-aace-600308960668", channel_id: 43, media: "some updated media", media_type: :"image,video,audio", doc_type: :"txt,pdf,xml,odt,doc,docx,xlsx,html,csv,md"}

      assert {:ok, %Message{} = message} = Messages.update_message(message, update_attrs)
      assert message.text == "some updated text"
      assert message.doc == "some updated doc"
      assert message.sender_id == "7488a646-e31f-11e4-aace-600308960668"
      assert message.receiver_id == "7488a646-e31f-11e4-aace-600308960668"
      assert message.channel_id == 43
      assert message.media == "some updated media"
      assert message.media_type == :"image,video,audio"
      assert message.doc_type == :"txt,pdf,xml,odt,doc,docx,xlsx,html,csv,md"
    end

    test "update_message/2 with invalid data returns error changeset" do
      message = message_fixture()
      assert {:error, %Ecto.Changeset{}} = Messages.update_message(message, @invalid_attrs)
      assert message == Messages.get_message!(message.id)
    end

    test "delete_message/1 deletes the message" do
      message = message_fixture()
      assert {:ok, %Message{}} = Messages.delete_message(message)
      assert_raise Ecto.NoResultsError, fn -> Messages.get_message!(message.id) end
    end

    test "change_message/1 returns a message changeset" do
      message = message_fixture()
      assert %Ecto.Changeset{} = Messages.change_message(message)
    end
  end
end
