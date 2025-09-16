defmodule Chat.MessagesContext do
  @moduledoc """
  The Messages context.
  
  ## Provides the methods for:
    
    - `list_all_dm/1`: Gets all direct messages.
    
    - `list_all_channel/1`: Gets all messages in the channel.
    
    - `send_dm/1`: Sends direct messages.
    
    - `send_channel/1`: Sends messages in the channel.
    
    - `create_message/1`: Creates a new message.
    
    - `delete_message/1`: Delete a message by its ID.
  """

  import Ecto.Query, warn: false

  alias Chat.Repo, as: Repo
  alias Chat.Message, as: Message
  alias Chat.User, as: User

  @doc """
  Retrieves all direct messages exchanged between two users.

  It sorts the messages by their insertion date, from oldest to newest.

  ## Parameters:

    - `user_one_id`: A string representing the ID of the first user.
    - `user_two_id`: A string representing the ID of the second user.

  ## Returns:

    - `{:ok, messages}`: A tuple where `messages` is a list of `Chat.Message` structs.
    - An empty list (`{:ok, []}`) is returned if no messages are found.

  ## Example:

    iex> Chat.MessagesContext.list_all_dm("user_uuid_1", "user_uuid_2")
    {:ok, [%Chat.Message{}, ...]}
  """
  @spec list_all_dm(String.t(), String.t()) :: {:ok, [Message.t()]}
  def list_all_dm(receiver_id, sender_id) do

    query = from message in Message,
      join: user in Use, on: message.sender_id == user.id,
      where:
        (message.sender_id == ^sender_id and message.receiver_id == ^receiver_id) or
        (message.receiver_id == ^receiver_id and message.sender_id == ^sender_id),
      order_by: [asc: message.created_at],
      limit: 30,
      select: %{

        text: message.text,
        doc: message.doc,
        media: message.media,
        created_at: message.created_at,
        sender: user.nick

      }

    {:ok, Repo.all(query)}

  end

  @doc """
  Retrieves the latest messages from a specific channel.

  ## Parameters:

    - `channel_id`: An integer representing the ID of the channel.

  ## Returns:

    - `{:ok, messages}`: A tuple where `messages` is a list of `Chat.Message` structs.
    - An empty list (`{:ok, []}`) is returned if no messages are found.

  ## Example:

    iex> Chat.MessagesContext.list_all_channel(1)
    {:ok, [%Chat.Message{channel_id: 1, ...}, ...]}
  """
  @spec list_all_channel(Integer.t()) :: {:ok, [Message.t()]}
  def list_all_channel(channel_id) do

    query = from message in Message,
      join: user in User, on: message.sender_id == user.id,
      where: message.channel_id == ^channel_id,
      order_by: [asc: message.created_at],
      limit: 30,
      select: %{

        text: message.text,
        doc: message.doc,
        media: message.media,
        created_at: message.created_at,
        sender: user.nick

      }

    {:ok, Repo.all(query)}

  end

  @doc """
  Creates a new message with the provided attributes.

  Receives a map of message attributes and returns a tuple indicating the result of the operation.

  ## Parameters:

    - `attrs`: A map containing the message attributes (e.g., `sender_id`, `text`, `channel_id`).

  ## Returns:

    - `{:ok, %Chat.Message{}}`: A tuple containing the created message.
    - `{:error, %Ecto.Changeset{}}`: A tuple containing the changeset with validation errors.

  ## Example:

    iex> Chat.MessagesContext.create_message(%{sender_id: "uuid", text: "Hello", ...})
    {:ok, %Chat.Message{sender_id: "uuid", text: "Hello", ...}}
  """

  @spec create_message(map()) :: {:ok, Message.t()} | {:error, Ecto.Changeset.t()}
  def create_message(message_params) do

    %Message{} 
    |> Message.changeset(message_params) 
    |> Repo.insert() 
 
  end

  @doc """
  Deletes a message by its ID.

  Receives the message's ID and returns a tuple indicating the result of the operation.

  ## Parameters:

    - `message_id`: An integer representing the ID of the message to be deleted.

  ## Returns:

    - `{:ok, %Chat.Message{}}`: A tuple containing the deleted message.
    - `{:error, :not_found}`: If the message with the given ID does not exist.

  ## Example:

    iex> Chat.MessagesContext.delete_message(1)
    {:ok, %Chat.Message{id: 1, ...}}
  """

  @spec delete_message(Integer.t()) :: {:ok, Message.t()} | {:error, :not_found}
  def delete_message(message_id) do
    case Repo.get(Message, message_id) do
 
      nil -> {:error, :not_found}
      message -> Repo.delete(message)

    end
  end
end
