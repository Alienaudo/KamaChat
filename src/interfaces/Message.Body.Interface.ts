enum mediaType {

    image,
    video,
    audio

};

export interface MessageBody {

    text: string | undefined,
    media: string | undefined,
    mediaType: mediaType | undefined

};
