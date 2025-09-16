defmodule ChatWeb.MessageChannel do
  use ChatWeb, :channel

  alias Chat.MessagesContext, as: Messages

  @impl true
  def join("messages:dm:" <> dm_ids, _payload, socket) do

    [sender_id, receiver_id] = String.split(dm_ids, ":")

    messages = case Messages.list_all_dm(sender_id, receiver_id) do

      {:ok, messages} -> messages
        _ -> []

    end

    {:ok, %{messages: messages}, socket}

  end

  @impl true
  def join("messages:channel:" <> channel_id, _payload, socket) do

    messages = case Messages.list_all_channel(String.to_integer(channel_id)) do

      {:ok, messages} -> messages
      _ -> []

    end

    {:ok, %{messages: messages}, socket}

  end

  @impl true
  def join(_topic, _payload, _socket) do

    {:error, %{reason: "Invaled topic"}}

  end

  @impl true
  def handle_in("new_message", message_params, socket) do

    case Messages.create_message(message_params) do

      {:ok, message} ->
        broadcast!(socket, "new_message", %{messages: message})
        {:noreply, socket}

      {:error, chageset} ->
        {:reply, {:error, %{error: changeset_errors(chageset)}}, socket}

    end

  end

  @impl true
  def handle_in("delete_message", %{"id" => id}, socket) do

    case Messages.delete_message(id) do

      {:ok, _message} ->
        broadcast!(socket, "delete_message", %{id: id})
        {:noreply, socket}
 
      {:error, :not_found} ->
        {:reply, {:error, %{messages: "Message not found"}}, socket}

      {:error, chageset} ->
        {:reply, {:error, %{error: changeset_errors(chageset)}}, socket}

    end

  end

  defp changeset_errors(changeset) do

    Ecto.Changeset.traverse_errors(changeset, fn {msg, opts} ->

      Enum.reduce(opts, msg, fn {key, value}, acc ->

        String.replace(acc, "%{#{key}}", to_string(value))

      end)

    end)

  end

  # Add authorization logic here as required.
  #  defp authorized?(_payload) do
  #  true
  #end
end
