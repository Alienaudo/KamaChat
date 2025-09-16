defmodule Chat.User do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  @derive {Jason.Encoder, only: [:email, :nick, :name, :profilePic]}
  schema "User" do

    field :email, :string
    field :nick, :string
    field :name, :string
    field :hashedPassword, :string
    field :profilePic, :string, default: "default-avatar.avif"

    has_many :sent_messages, Chat.Message, foreign_key: :sender_id
    has_many :received_messages, Chat.Message, foreign_key: :receiver_id
    has_many :channels_member, Chat.ChannelMember, foreign_key: :user_id

    timestamps(
      type: :utc_datetime_usec,
      inserted_at: :created_at
    )

  end

  def changeset(user, attrs) do

    user
    |> cast(attrs, [
      :email,
      :nick,
      :name,
      :profilePic
    ])
    |> validate_required([:email, :nick, :name])
    |> validate_length(:email, max: 100)
    |> validate_length(:nick, min: 3, max: 25)
    |> validate_length(:name, min: 3, max: 35)
    |> validate_format(:email, ~r/^[^\s]+@[^\s]+$/, message: "Must be a valed email")
    |> unique_constraint(:email)
    |> unique_constraint(:nick)

  end

end
