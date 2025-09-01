defmodule Chat.Message do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :id, autogenerate: true}
  @derive {Jason.Encoder, only: [:text, :media, :doc]}
  schema "Message" do

    field :text, :string
    field :media, :string
    field :media_type, Ecto.Enum, values: [:image, :video, :audio], source: :media_type
    field :doc, :string
    field :doc_type, Ecto.Enum, values: [:txt, :pdf, :xml, :odt, :doc, :docx, :xlsx, :html, :csv, :md], source: :doc_type

    belongs_to :sender, Chat.User, foreign_key: :sender_id, references: :id, type: Ecto.UUID
    belongs_to :receiver, Chat.User, foreign_key: :receiver_id, references: :id, type: Ecto.UUID
    belongs_to :channel, Chat.Channel, foreign_key: :channel_id, references: :id, type: :integer

    timestamps(
      type: :utc_datetime_usec,
      inserted_at: :created_at,
      updated_at: false
    )

  end

  def changeset(message, attrs) do

    message
    |> cast(attrs, [
      :sender_id,
      :receiver_id,
      :channel_id,
      :text,
      :media,
      :media_type,
      :doc,
      :doc_type
    ])
    |> validate_required([:sender_id])
    |> validate_length(:text, min: 1, max: 350)
    |> validate_inclusion(:media_type, [:image, :video, :audio])
    |> validate_inclusion(:doc_type, [:txt, :pdf, :xml, :odt, :doc, :docx, :xlsx, :html, :csv, :md])
    |> foreign_key_constraint(:sender_id, name: :messages_sender_id_fkey)
    |> foreign_key_constraint(:receiver_id, name: :messages_receiver_id_fkey)
    |> foreign_key_constraint(:channel_id, name: :messages_channel_id_fkey)

  end
end
