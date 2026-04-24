import { Expose, plainToClass } from "class-transformer";

type ReverseShareWithCreator = Partial<ReverseShareDTO> & {
  creator?: { locale?: string } | null;
};

export class ReverseShareDTO {
  @Expose()
  id: string;

  @Expose()
  name?: string;

  @Expose()
  maxShareSize: string;

  @Expose()
  shareExpiration: Date;

  @Expose()
  token: string;

  @Expose()
  simplified: boolean;

  @Expose()
  creatorLocale?: string;

  from(partial: ReverseShareWithCreator | null) {
    const { creator, ...rest } = partial ?? {};
    const dto = plainToClass(ReverseShareDTO, rest, {
      excludeExtraneousValues: true,
    });
    if (creator?.locale) {
      dto.creatorLocale = creator.locale;
    }
    return dto;
  }
}
